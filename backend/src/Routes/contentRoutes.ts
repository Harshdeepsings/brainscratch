import { Router, Response } from "express";
import { UserMiddleware, AuthRequest } from "../middleware";
import { ContentModel, TagModel } from "../db";
import mongoose from "mongoose";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { classifyUrl, isValidHttpUrl } from "../urlClassifier";

const contentRoutes = Router();

// Rate limiting for content mutations (prevents database flooding & automated spam)
const contentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { message: "Too many content requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false
});

// Supported content types
const SUPPORTED_TYPES = [
    "youtube",
    "twitter",
    "instagram",
    "linkedin",
    "googledocs",
    "googlesheets",
    "notion",
    "text"
] as const;

// Create content schema: Accepts a link (which is auto-classified) and/or a body note
const CreateContentSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title must be at most 200 characters").trim(),
    link: z.string().trim().optional().nullable(),
    body: z.string().max(10000, "Note body must be at most 10000 characters").trim().optional().nullable(),
    type: z.enum(SUPPORTED_TYPES).optional(),
    tags: z.array(z.string().max(30).trim().toLowerCase().transform(t => t.toLowerCase().replace(/^#/, ""))).max(10).optional().default([])
}).refine(data => {
    return Boolean((data.link && data.link.trim()) || (data.body && data.body.trim()));
}, {
    message: "Either a link or note content is required."
});

// Edit content schema
const EditContentSchema = z.object({
    title: z.string().min(1).max(200).trim().optional(),
    link: z.string().trim().optional().nullable(),
    body: z.string().max(10000).trim().optional().nullable(),
    type: z.enum(SUPPORTED_TYPES).optional(),
    tags: z.array(z.string().max(30).trim().toLowerCase().transform(t => t.toLowerCase().replace(/^#/, ""))).max(10).optional()
});

// Helper: upsert tags and return ObjectIds (strictly lowercase without '#')
async function resolveTags(tags: string[]) {
    const cleanTags = Array.from(new Set(tags.map(t => t.trim().toLowerCase().replace(/^#/, '')).filter(Boolean))).slice(0, 10);
    return Promise.all(
        cleanTags.map(async (tagTitle) => {
            const tag = await TagModel.findOneAndUpdate(
                { title: tagTitle },
                { $setOnInsert: { title: tagTitle } },
                { upsert: true, new: true }
            );
            return tag!._id;
        })
    );
}

// Helper: remove tags from TagModel that are no longer referenced by any Content
export async function cleanupOrphanedTags(tagIds?: (mongoose.Types.ObjectId | string)[]) {
    try {
        if (tagIds && tagIds.length > 0) {
            for (const tagId of tagIds) {
                const stillInUse = await ContentModel.exists({ tags: tagId });
                if (!stillInUse) {
                    await TagModel.deleteOne({ _id: tagId });
                }
            }
        } else {
            const usedTagIds = await ContentModel.distinct("tags");
            await TagModel.deleteMany({ _id: { $nin: usedTagIds } });
        }
    } catch (err) {
        console.error("Orphaned tags cleanup error:", err);
    }
}

// CREATE CONTENT (auto-classifies links with social-media-parser)
contentRoutes.post("/post", UserMiddleware, contentLimiter, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = CreateContentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        });
    }

    const data = parsed.data;
    const cleanLink = data.link ? data.link.trim() : null;
    const cleanBody = data.body ? data.body.trim() : null;

    // Automatically classify content type using social-media-parser & URL rules if not explicitly set
    let determinedType = data.type;
    if (!determinedType) {
        const classification = classifyUrl(cleanLink || undefined);
        determinedType = classification.type;
    }

    try {
        const tagIds = data.tags ? await resolveTags(data.tags) : [];

        await ContentModel.create({
            title: data.title,
            link: cleanLink,
            body: cleanBody,
            type: determinedType,
            userId: req.userId,
            tags: tagIds
        });

        res.status(201).json({
            message: "content added",
            type: determinedType
        });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// EDIT CONTENT (enforces ownership)
contentRoutes.put("/edit/:contentId", UserMiddleware, contentLimiter, async (req: AuthRequest, res: Response) => {
    const contentId = typeof req.params.contentId === "string" ? req.params.contentId : "";

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({ message: "Invalid content ID format" });
    }

    const parsed = EditContentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        });
    }

    const updates = parsed.data;

    try {
        // Enforce ownership: only the owner can update their content
        const existing = await ContentModel.findOne({
            _id: contentId,
            userId: req.userId
        });

        if (!existing) {
            return res.status(404).json({ message: "Content not found or unauthorized" });
        }

        // Auto-reclassify type if link was updated and type was not explicitly changed
        if (updates.link !== undefined && updates.type === undefined) {
            if (updates.link && updates.link.trim()) {
                updates.type = classifyUrl(updates.link.trim()).type;
            } else {
                updates.type = "text";
            }
        }

        const oldTags = existing.tags || [];

        if (updates.tags) {
            (updates as any).tags = await resolveTags(updates.tags);
        }

        await ContentModel.updateOne(
            { _id: contentId, userId: req.userId },
            { $set: updates }
        );

        if (updates.tags && oldTags.length > 0) {
            cleanupOrphanedTags(oldTags).catch(() => {});
        }

        res.json({ message: "content updated" });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE CONTENT (enforces ownership)
contentRoutes.delete("/delete/:contentId", UserMiddleware, contentLimiter, async (req: AuthRequest, res: Response) => {
    const contentId = typeof req.params.contentId === "string" ? req.params.contentId : "";

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({ message: "Invalid content ID format" });
    }

    try {
        const existing = await ContentModel.findOne({
            _id: contentId,
            userId: req.userId
        });

        if (!existing) {
            return res.status(404).json({
                message: "Content not found or unauthorized"
            });
        }

        const tagsToVerify = existing.tags;
        await ContentModel.deleteOne({ _id: contentId, userId: req.userId });

        if (tagsToVerify && tagsToVerify.length > 0) {
            cleanupOrphanedTags(tagsToVerify).catch(() => {});
        }

        res.json({ message: "content deleted" });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default contentRoutes;
