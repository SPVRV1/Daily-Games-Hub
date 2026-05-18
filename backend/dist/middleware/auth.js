import jwt from "jsonwebtoken";
import { isBlacklisted } from "../utils/auth.js";
export const verifyToken = (req, res, next) => {
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
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            ok: false,
            error: "Invalid token",
        });
    }
};
