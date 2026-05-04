import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};
export const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};
export const generateToken = (userId) => {
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });
};
