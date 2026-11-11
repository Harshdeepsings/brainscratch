import mongoose, { model, Schema } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: false },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: "" }
});

const ContentSchema = new Schema({
    title: { type: String, required: true, trim: true },
    link: { type: String, trim: true },
    body: { type: String, trim: true },
    type: {
        type: String,
        required: true,
        enum: ["youtube", "twitter", "instagram", "linkedin", "googledocs", "googlesheets", "notion", "text"]
    },
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, index: true }
}, { timestamps: true });

// Compound index for user library queries sorted by creation date (prevents COLLSCAN)
ContentSchema.index({ userId: 1, createdAt: -1 });

const TagSchema = new Schema({
    title: { type: String, unique: true, trim: true, lowercase: true }
});

const LinkSchema = new Schema({
    hash: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true }
});

export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);
export const TagModel = model("Tag", TagSchema);
export const LinkModel = model("Link", LinkSchema);

const VerificationCodeSchema = new Schema({
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    type: { type: String, enum: ["signup", "profile_update", "password_reset"], default: "signup" }
}, { timestamps: true });

export const VerificationCodeModel = model("VerificationCode", VerificationCodeSchema);
