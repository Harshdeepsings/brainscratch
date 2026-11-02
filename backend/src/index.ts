import dotenv from "dotenv";
dotenv.config();

// Guard required env vars before anything else starts
if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is not set.");
    process.exit(1);
}
if (!process.env.MONGODB_URI) {
    console.error("FATAL: MONGODB_URI environment variable is not set.");
    process.exit(1);
}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import userRoutes from "./Routes/userRoutes";
import contentRoutes from "./Routes/contentRoutes";
import shareRoutes from "./Routes/shareRoutes";


const app = express();
app.use(express.json());

// Restrict CORS to the frontend origin; falls back to wildcard in development
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

const PORT = process.env.PORT || 3000;

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        
    }catch(e){
        console.error("MongoDB connection failed:", e);
        process.exit(1);  // Don't keep running without a DB
    }
};

app.use("/api/v1/user", userRoutes);

app.use("/api/v1/content", contentRoutes);

app.use("/api/v1/brain/share", shareRoutes);


connectDB();