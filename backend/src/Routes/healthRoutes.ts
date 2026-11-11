import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const healthRoutes = Router();

/**
 * Lightweight Express liveness probe.
 * Minimal allocation and sub-millisecond response for automated uptime checks.
 * GET /health/express or /api/v1/health/express
 */
healthRoutes.get("/express", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        uptime: Math.floor(process.uptime())
    });
});

/**
 * Lightweight system readiness check (Express + MongoDB).
 * GET /health or /api/v1/health
 */
healthRoutes.get("/", (_req: Request, res: Response) => {
    const isDbConnected = mongoose.connection.readyState === 1;

    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? "ok" : "degraded",
        uptime: Math.floor(process.uptime()),
        db: isDbConnected
    });
});

export default healthRoutes;