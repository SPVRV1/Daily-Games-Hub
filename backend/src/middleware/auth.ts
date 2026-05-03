import { Router, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: any;
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

    try {
        const secret = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            ok: false,
            error: "Invalid token",
        });
    }
};