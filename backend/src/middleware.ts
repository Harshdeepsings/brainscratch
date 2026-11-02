import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// In-memory blacklist for invalidated tokens (cleared on server restart)
export const tokenBlacklist = new Set<string>();


export interface AuthRequest extends Request {
    userId?: string
}

interface JwtPayload {
    id: string
}
 

export function UserMiddleware(req: AuthRequest, res: Response, next: NextFunction){

     
    const header = req.headers["authorization"];

    if(!header){
        res.status(401).json({
            message: "no token provided"
        });
        return;
    }

    const token = typeof header === "string" && header.startsWith("Bearer ")
        ? header.slice(7).trim()
        : (header as string);

    if (tokenBlacklist.has(header as string) || tokenBlacklist.has(token)) {
        res.status(401).json({
            message: "token has been invalidated, please login again"
        });
        return;
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        req.userId = decoded.id;
        next();
    }catch(err){
        res.status(401).json({
            message: "invalid or expired token"
        });
    }
}