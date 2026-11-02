import { Router } from "express";
import { Response } from "express";
import { UserMiddleware, AuthRequest } from "../middleware";
import { ContentModel, TagModel } from "../db";
import mongoose from "mongoose";
import { z } from "zod";


const contentRoutes = Router();

// Validation schema for content creation
const ContentSchema = z.object({
    title: z.string().min(1, "Title is required").max(200).trim(),
    link: z.string().url("Link must be a valid URL").trim(),
    type: z.enum(["youtube", "twitter"], { message: "Type must be 'youtube' or 'twitter'" }),
    tags: z.array(z.string().trim().toLowerCase()).optional().default([])
});

contentRoutes.post("/post", UserMiddleware, async(req: AuthRequest, res: Response)=>{

    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    const parsed = ContentSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Invalid input",
            errors: parsed.error.flatten().fieldErrors
        });
    }

    const { title, link, type, tags } = parsed.data;

    try{
        // Upsert each tag by title and collect their ObjectIds
        const tagIds = await Promise.all(
            tags.map(async (tagTitle) => {
                const tag = await TagModel.findOneAndUpdate(
                    { title: tagTitle },
                    { $setOnInsert: { title: tagTitle } },
                    { upsert: true, new: true }
                );
                return tag!._id;
            })
        );

        await ContentModel.create({
            link,
            type,
            title,
            userId: req.userId,
            tags: tagIds
        });

        res.status(201).json({
            message: "content added"
        });
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// Using URL param instead of req.body for DELETE (avoids proxy stripping issues)
contentRoutes.delete("/delete/:contentId", UserMiddleware, async (req: AuthRequest, res: Response)=>{
    const contentId = typeof req.params.contentId === "string" ? req.params.contentId : "";

    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    if (!contentId || !mongoose.Types.ObjectId.isValid(contentId)) {
        return res.status(400).json({
            message: "Invalid content ID format"
        });
    }

    try{
        const deleted = await ContentModel.deleteOne({
            _id: contentId,
            userId: req.userId
        });

        if (deleted.deletedCount === 0) {
            return res.status(404).json({ 
                message: "Content not found or unauthorized" 
            });
        }

        res.json({
            message: "content deleted"
        });
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


export default contentRoutes;