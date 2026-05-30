import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isBlacklisted } from "../utils/auth.js";

export interface AuthRequest extends Request {
    userId?: number;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

    if (!token) {
        res.status(401).json({
            ok: false,
            error: "No token provided",
        });
        return;
    }

    if (isBlacklisted(token)) {
        res.status(401).json({ ok: false, error: "Token has been invalidated" });
        return;
    }

    try {
        const secret = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token, secret) as {
            userId: number;
        };

        req.userId = decoded.userId;

        next();
    } catch (error) {
        res.status(401).json({
            ok: false,
            error: "Invalid token",
        });
    }
};