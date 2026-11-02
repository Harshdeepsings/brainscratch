import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from "./Routes/userRoutes";
import contentRoutes from "./Routes/contentRoutes";
import shareRoutes from "./Routes/shareRoutes";

const { JWT_SECRET, MONGODB_URI, PORT = 3000, FRONTEND_URL } = process.env;

if (!JWT_SECRET){ 
    console.error("FATAL: JWT_SECRET is not set.");  
    process.exit(1); 
}
if (!MONGODB_URI){ 
    console.error("FATAL: MONGODB_URI is not set."); 
    process.exit(1); 
}

const app = express();

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL ? FRONTEND_URL : true, credentials: true }));

// Simple traffic counter (must run before routes to count all requests)
let totalRequests = 0;
app.use((_req, _res, next) => { totalRequests++; next(); });
app.get("/api/v1/stats", (_req, res) => res.json({ totalRequests }));

// Routes
app.use("/api/v1/user",        userRoutes);
app.use("/api/v1/content",     contentRoutes);
app.use("/api/v1/brain/share", shareRoutes);

// Connect to DB then start server
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((e) => {
        console.error("MongoDB connection failed:", e);
        process.exit(1);
    });