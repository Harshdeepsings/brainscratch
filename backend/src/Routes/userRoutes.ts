import { Router } from "express";
import { Response } from "express";
import path from "path";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
import { UserSchema, UserSignupSchema, ProfileUpdateSchema } from "../userValidation";
import { UserModel, ContentModel, LinkModel } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserMiddleware, AuthRequest, tokenBlacklist } from "../middleware";
import rateLimit from "express-rate-limit";
import { OAuth2Client } from "google-auth-library";
import { createVerificationCode, verifyTimeRestrictedCode } from "../emailVerification";
import { cleanupOrphanedTags } from "./contentRoutes";

const userRoutes = Router();

// Constant-time dummy hash used to neutralize timing attacks when username does not exist
const DUMMY_HASH = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

const FALLBACK_GOOGLE_CLIENT_ID = "874276076457-805b58bjb7d7uoebornifpr9e82l9bt1.apps.googleusercontent.com";

// Google OAuth client helper (reads environment lazily with fallback client ID)
function getGoogleClientId(): string {
    return (
        process.env.GOOGLE_CLIENT_ID ||
        process.env.VITE_GOOGLE_CLIENT_ID ||
        FALLBACK_GOOGLE_CLIENT_ID
    ).trim();
}

function getGoogleClient(): OAuth2Client {
    return new OAuth2Client(getGoogleClientId());
}

// Strict authentication rate limiting (max 20 attempts per 15 min per IP)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

// Send Time-Restricted Verification Code for Email Signup
userRoutes.post("/send-code", authLimiter, async function (req: AuthRequest, res: Response) {
    const { email, username } = req.body;

    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Valid email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address format" });
    }

    try {
        // Check if an account already exists with this email
        const existingEmail = await UserModel.findOne({ email: normalizedEmail });
        if (existingEmail) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        // Check if username is already taken if provided
        if (username && typeof username === "string") {
            const existingUser = await UserModel.findOne({ username: username.trim() });
            if (existingUser) {
                return res.status(409).json({ message: "Username is already taken" });
            }
        }

        const { code, expiresAt } = await createVerificationCode(normalizedEmail, "signup");
        const isDev = process.env.NODE_ENV !== "production";

        res.json({
            message: "Verification code sent to your email. Valid for 10 minutes.",
            expiresAt,
            ...(isDev ? { devCode: code } : {})
        });
    } catch (e) {
        console.error("Failed to generate verification code:", e);
        res.status(500).json({ message: "Failed to send verification code. Please try again." });
    }
});

// Signup (verified with time-restricted 6-digit code)
userRoutes.post("/signup", authLimiter, async function (req: AuthRequest, res: Response) {
    const parsed = UserSignupSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        });
    }

    const { username, password, email, code } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // Verify time-restricted code
    const verification = await verifyTimeRestrictedCode(normalizedEmail, code, "signup");
    if (!verification.valid) {
        return res.status(400).json({
            message: verification.reason || "Invalid or expired verification code."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await UserModel.create({
            username: username.trim(),
            password: hashedPassword,
            email: normalizedEmail
        });

        res.status(201).json({
            message: "Account verified and registered successfully!"
        });
    } catch (e: any) {
        if (e.code === 11000) {
            return res.status(409).json({
                message: "Username is already taken"
            });
        }

        res.status(500).json({
            message: "Something went wrong"
        });
    }
});

// Signin
userRoutes.post("/signin", authLimiter, async function (req: AuthRequest, res: Response) {
    const rawIdentifier = req.body.identifier || req.body.username || req.body.email;
    const password = req.body.password;

    if (!rawIdentifier || typeof rawIdentifier !== "string" || !password || typeof password !== "string") {
        return res.status(400).json({
            message: "Username or email and password are required"
        });
    }

    const identifier = rawIdentifier.trim();

    try {
        let user = null;
        const isEmail = identifier.includes("@");

        if (isEmail) {
            const normalizedEmail = identifier.toLowerCase();
            const matchingUsers = await UserModel.find({ email: normalizedEmail });

            for (const candidate of matchingUsers) {
                if (candidate.password) {
                    const match = await bcrypt.compare(password, candidate.password);
                    if (match) {
                        user = candidate;
                        break;
                    }
                }
            }

            if (!user) {
                if (matchingUsers.length === 0) {
                    await bcrypt.compare(password, DUMMY_HASH);
                }
                return res.status(401).json({
                    message: "Invalid username, email, or password"
                });
            }
        } else {
            user = await UserModel.findOne({ username: identifier });

            // If user doesn't exist or is Google-only, perform dummy compare to prevent timing enumeration
            if (!user || !user.password) {
                await bcrypt.compare(password, DUMMY_HASH);
                return res.status(401).json({
                    message: "Invalid username, email, or password"
                });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    message: "Invalid username, email, or password"
                });
            }
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        return res.json({ token });
    } catch (e) {
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

// Forgot Password: sends time-restricted 6-digit reset code ONLY to registered email
userRoutes.post("/forgot-password", authLimiter, async function (req: AuthRequest, res: Response) {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Registered email address is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address format" });
    }

    try {
        const user = await UserModel.findOne({ email: normalizedEmail });

        if (user) {
            // Send time-restricted 6-digit code valid for 10 minutes
            const { code, expiresAt } = await createVerificationCode(normalizedEmail, "password_reset");
            const isDev = process.env.NODE_ENV !== "production";

            return res.json({
                message: "If an account with this email exists, a 6-digit password reset code has been sent.",
                expiresAt,
                ...(isDev ? { devCode: code } : {})
            });
        }

        // Return the exact same neutral message to prevent user enumeration
        res.json({
            message: "If an account with this email exists, a 6-digit password reset code has been sent."
        });
    } catch (e) {
        console.error("Forgot password error:", e);
        res.status(500).json({ message: "Failed to process request. Please try again later." });
    }
});

// Reset Password: validates 6-digit email code and updates password
userRoutes.post("/reset-password", authLimiter, async function (req: AuthRequest, res: Response) {
    const { email, code, newPassword } = req.body;

    if (!email || typeof email !== "string" || !code || typeof code !== "string" || !newPassword || typeof newPassword !== "string") {
        return res.status(400).json({ message: "Email, 6-digit code, and new password are required" });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify time-restricted code
    const verification = await verifyTimeRestrictedCode(normalizedEmail, code, "password_reset");
    if (!verification.valid) {
        return res.status(400).json({
            message: verification.reason || "Invalid or expired verification code."
        });
    }

    try {
        const user = await UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: "User account not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({
            message: "Password reset successful! You can now sign in with your new password."
        });
    } catch (e) {
        console.error("Reset password error:", e);
        res.status(500).json({ message: "Failed to reset password. Please try again." });
    }
});

// Google OAuth: verifies ID token, checks email_verified, links or creates user
userRoutes.post("/google", authLimiter, async function (req: AuthRequest, res: Response) {
    const { credential } = req.body;

    if (!credential || typeof credential !== "string") {
        return res.status(400).json({ message: "Google credential is required" });
    }

    const clientId = getGoogleClientId();
    const googleClient = getGoogleClient();

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: clientId
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: "Invalid Google token payload" });
        }

        // Security check: Never link accounts if Google email is unverified
        if (!payload.email_verified) {
            return res.status(401).json({ message: "Google account email is not verified" });
        }

        const { sub: googleId, email, name } = payload;
        const normalizedEmail = email.toLowerCase();

        // Search for existing user by Google ID or verified Email
        let user = await UserModel.findOne({
            $or: [
                { googleId },
                { email: normalizedEmail }
            ]
        });

        if (user) {
            // Link Google ID if user previously registered with password
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new Google-authenticated user with a unique username
            const baseUsername = (name || normalizedEmail.split("@")[0] || "user")
                .replace(/[^a-zA-Z0-9_]/g, "")
                .slice(0, 25);
            let username = baseUsername || "user";
            let counter = 1;

            while (await UserModel.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await UserModel.create({
                username,
                email: normalizedEmail,
                googleId
            });
        }

        const token = jwt.sign(
            { id: user._id.toString() },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        res.json({ token });
    } catch (e: any) {
        console.error("Google auth verification failed:", e?.message || e);
        res.status(401).json({ message: "Google authentication failed" });
    }
});

// User content fetch (supports optional pagination: ?page=1&limit=20)
userRoutes.get("/content", UserMiddleware, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const page = req.query.page ? Math.max(1, parseInt(req.query.page as string, 10) || 1) : null;
        const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20)) : 20;

        const filter = { userId: req.userId };
        const total = await ContentModel.countDocuments(filter);

        let query = ContentModel.find(filter)
            .select("-__v")
            .populate("userId", "username")
            .populate("tags", "title")
            .sort({ createdAt: -1 })
            .lean();

        if (page !== null) {
            query = query.skip((page - 1) * limit).limit(limit);
        }

        const content = await query;
        const hasMore = page !== null ? page * limit < total : false;

        res.json({
            content,
            total,
            page: page ?? 1,
            totalPages: page !== null ? Math.ceil(total / limit) : 1,
            hasMore
        });
    } catch (e) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get User Profile
userRoutes.get("/profile", UserMiddleware, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const user = await UserModel.findById(req.userId).select("username email avatar googleId password").lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            username: user.username,
            email: user.email,
            avatar: (user as any).avatar || "",
            isGoogle: Boolean(user.googleId),
            hasPassword: Boolean(user.password)
        });
    } catch {
        res.status(500).json({ message: "Failed to fetch profile" });
    }
});

// Update User Profile (only username, email, avatar)
userRoutes.put("/profile", UserMiddleware, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = ProfileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Validation failed",
            errors: parsed.error.flatten().fieldErrors
        });
    }

    const { username, email, avatar } = parsed.data;

    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Username update & collision check
        if (username && username !== user.username) {
            const existingUser = await UserModel.findOne({
                username,
                _id: { $ne: req.userId }
            });
            if (existingUser) {
                return res.status(409).json({ message: "Username is already taken" });
            }
            user.username = username;
        }

        // Email update & uniqueness check
        if (email && email !== user.email) {
            const normalized = email.trim().toLowerCase();
            const existingEmail = await UserModel.findOne({
                email: normalized,
                _id: { $ne: req.userId }
            });
            if (existingEmail) {
                return res.status(409).json({ message: "Email is already registered" });
            }
            user.email = normalized;
        }

        // Avatar update (URL or image string)
        if (avatar !== undefined) {
            (user as any).avatar = avatar;
        }

        await user.save();

        res.json({
            message: "Profile updated successfully",
            user: {
                username: user.username,
                email: user.email,
                avatar: (user as any).avatar || ""
            }
        });
    } catch {
        res.status(500).json({ message: "Failed to update profile" });
    }
});

// Change Password (authenticated user inside Profile Modal)
userRoutes.put("/change-password", UserMiddleware, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
        return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    try {
        const user = await UserModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: "Password updated successfully!" });
    } catch (e) {
        console.error("Change password error:", e);
        res.status(500).json({ message: "Failed to update password. Please try again." });
    }
});

// Logout
userRoutes.post("/logout", UserMiddleware, (req: AuthRequest, res: Response) => {
    const token = req.headers["authorization"] as string;

    if (token) {
        tokenBlacklist.add(token);
        if (token.startsWith("Bearer ")) {
            tokenBlacklist.add(token.slice(7).trim());
        }
    }

    res.status(200).json({
        message: "Logged out successfully"
    });
});

// Delete Account: completely cascades deletion of user, content, and shared links
userRoutes.delete("/account", UserMiddleware, async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = req.userId;

        // Cascade delete: content items, shared brain link, and the user document
        await Promise.all([
            ContentModel.deleteMany({ userId }),
            LinkModel.deleteMany({ userId }),
            UserModel.findByIdAndDelete(userId)
        ]);

        // Clean up any tags left unreferenced across the database
        cleanupOrphanedTags().catch(() => {});

        // Invalidate current authorization token in blacklist
        const token = req.headers["authorization"] as string;
        if (token) {
            tokenBlacklist.add(token);
            if (token.startsWith("Bearer ")) {
                tokenBlacklist.add(token.slice(7).trim());
            }
        }

        res.status(200).json({
            message: "Account and all associated information permanently deleted."
        });
    } catch (e) {
        console.error("Account deletion failed:", e);
        res.status(500).json({ message: "Failed to delete account. Please try again." });
    }
});

export default userRoutes;