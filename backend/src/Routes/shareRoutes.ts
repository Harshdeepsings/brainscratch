import { Router, Response } from "express";
import { UserMiddleware, AuthRequest } from "../middleware";
import { UserModel, ContentModel, LinkModel } from "../db";
import { random } from "../utils";
import rateLimit from "express-rate-limit";

const shareRoutes = Router();

// Rate limiting for share link creation/toggling
const shareToggleLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { message: "Too many share operations. Please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for public share link queries (prevents automated hash brute-forcing)
const shareLookupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { message: "Too many share link requests. Please slow down." },
    standardHeaders: true,
    legacyHeaders: false
});

const HASH_REGEX = /^[a-zA-Z0-9]{15}$/;

// Enable / Disable Share Link
shareRoutes.post(["/", "/share"], UserMiddleware, shareToggleLimiter, async (req: AuthRequest, res: Response) => {
    const share = req.body.share;

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        if (share) {
            const linkExists = await LinkModel.findOne({ userId: req.userId });

            if (linkExists) {
                return res.json({
                    hash: linkExists.hash,
                    message: linkExists.hash
                });
            }

            // Cryptographically secure 15-character random alphanumeric string
            const newhash = random(15);
            await LinkModel.create({
                userId: req.userId,
                hash: newhash
            });

            return res.json({
                hash: newhash,
                message: newhash
            });
        } else {
            await LinkModel.deleteOne({ userId: req.userId });
            return res.json({ message: "Share link disabled" });
        }
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Public Share Link Lookup
shareRoutes.get("/:sharelink", shareLookupLimiter, async (req: AuthRequest, res: Response) => {
    const hash = req.params.sharelink;

    // Strict validation: must be exact 15-character alphanumeric string
    if (typeof hash !== "string" || !HASH_REGEX.test(hash.trim())) {
        return res.status(400).json({ message: "Invalid share link format" });
    }

    try {
        const link = await LinkModel.findOne({ hash: hash.trim() });

        if (!link) {
            return res.status(404).json({ message: "Share link not found" });
        }

        // Minimal Projection: Exclude internal userId and private fields
        const content = await ContentModel.find({ userId: link.userId })
            .select("title link body type tags createdAt")
            .populate("tags", "title")
            .sort({ createdAt: -1 });

        const user = await UserModel.findOne({ _id: link.userId }).select("username");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            username: user.username,
            content
        });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default shareRoutes;