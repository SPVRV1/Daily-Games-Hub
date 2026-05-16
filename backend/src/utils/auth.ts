import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const tokenBlacklist = new Set<string>();

export const addToBlacklist = (token: string) => {
    tokenBlacklist.add(token);
};

export const isBlacklisted = (token: string): boolean => {
    return tokenBlacklist.has(token);
};

export const hashPassword = async (password: string) => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};

export const generateToken = (userId: number) => {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};