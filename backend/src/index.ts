import path from "path";
import dotenv from "dotenv";

// Load environment variables reliably regardless of working directory
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./Routes/userRoutes";
import contentRoutes from "./Routes/contentRoutes";
import shareRoutes from "./Routes/shareRoutes";
import healthRoutes from "./Routes/healthRoutes";

const { JWT_SECRET, MONGODB_URI, PORT = 3000, FRONTEND_URL } = process.env;

if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET is not set.");
    process.exit(1);
}
if (!MONGODB_URI) {
    console.error("FATAL: MONGODB_URI is not set.");
    process.exit(1);
}

const app = express();

// Security & Parsing Middleware
app.set("trust proxy", 1);

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(express.json({ limit: "50kb" }));

// CORS
const isDev = process.env.NODE_ENV !== "production";

const envOrigins = FRONTEND_URL
    ? FRONTEND_URL.split(",").map(url => url.trim()).filter(Boolean)
    : [];

const allowedOrigins = [
    ...envOrigins,
    ...(isDev ? [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ] : [])
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error("CORS origin not allowed by policy."));
    },
    credentials: true
}));

// Rate Limiting
app.use("/api/", rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { message: "Too many requests, please try again later." }
}));

// Routes
app.use("/health", healthRoutes);
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/brain/share", shareRoutes);

// 404 & Centralized Error Handlers
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        message: "Route not found"
    });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Server Error:", err?.message || err);
    res.status(err?.status || 500).json({
        message: err?.message && err.status < 500 ? err.message : "Internal server error"
    });
});

// Database & Server Initialization
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });
