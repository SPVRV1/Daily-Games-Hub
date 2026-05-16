import { Router } from "express";
import { getUsersCollection } from "../db.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";
import { hashPassword, comparePassword, generateToken } from "../utils/auth.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { sendResetEmail } from "../utils/mailer.js";
import { createUser } from "../models/userFactory.js"
import { registerSchema } from "../utils/validator.js";
import { addToBlacklist } from "../utils/auth.js";
import { Console, log } from "console";

const router = Router();

router.get("/data", verifyToken, async (_req: AuthRequest, res) => {
//router.get("/data", async (_req, res) => {
    try {
        const { id } = _req.query;
        const _id = Number(id);

        if (!_id || typeof _id !== "number" || isNaN(_id)) {
            res.status(400).json({
                ok: false,
                error: "Valid ID query parameter is required",
            });
            return;
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ _id });

        if (!user) {
            res.status(404).json({
                ok: false,
                error: "User not found",
            });
            return;
        }

        res.json({
            ok: true,
            user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
            ok: false,
            error: message,
        });
    }
});

router.post("/register", async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                ok: false,
                error: parsed.error.issues[0].message,
            });
        }

        const { username, email, password } = parsed.data;

        const collection = await getUsersCollection();

        const exists = await collection.findOne({
            $or: [{ username }, { email }],
        });

        if (exists) {
            return res.status(409).json({
                ok: false,
                error: "Username or email already exists",
            });
        }

        const hashed = await hashPassword(password);

        const user = createUser({
            _id: Date.now(),
            username,
            email,
            password_hash: hashed,
        });

        await collection.insertOne(user);

        return res.status(201).json({
            ok: true,
            message: "User created successfully",
        });

    } catch (err) {
        return res.status(500).json({
            ok: false,
            error: "Server error",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ ok: false });
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ username });

        if (!user) {
            return res.status(401).json({ ok: false, error: "Invalid credentials" });
        }

        const valid = await comparePassword(password, user.password_hash);

        if (!valid) {
            return res.status(401).json({ ok: false, error: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.json({ ok: true, token });

    } catch {
        res.status(500).json({ ok: false });
    }
});

router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ ok: false });
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ email });

        if (!user) {
            return res.json({ ok: true }); // security
        }

        const token = crypto.randomBytes(32).toString("hex");
        const hashed = await bcrypt.hash(token, 10);

        await collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    resetPasswordToken: hashed,
                    resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000),
                },
            }
        );

        await sendResetEmail(email, token);

        res.json({ ok: true });

    } catch {
        res.status(500).json({ ok: false });
    }
});

router.post("/reset-password", async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ ok: false });
        }

        const collection = await getUsersCollection();
        const users = await collection.find({
            resetPasswordExpires: {$gt: new Date()}
        }).toArray();

        let found = null;

        const now = new Date();

        for (const u of users) {
            if (
                u.resetPasswordToken &&
                u.resetPasswordExpires &&
                u.resetPasswordExpires > now &&
                (await bcrypt.compare(token, u.resetPasswordToken))
            ) {
                found = u;
                break;
            }
        }

        if (!found) {
            return res.status(400).json({ ok: false, error: "Invalid token" });
        }

        const hashed = await hashPassword(password);

        await collection.updateOne(
            { _id: found._id },
            {
                $set: { password_hash: hashed },
                $unset: {
                    resetPasswordToken: "",
                    resetPasswordExpires: "",
                },
            }
        );

        res.json({ ok: true });

    } catch {
        res.status(500).json({ ok: false });
    }
});

router.post("/logout", verifyToken, (req: AuthRequest, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        return res.status(400).json({ ok: false, error: "No token provided" });
    }

    addToBlacklist(token);

    return res.json({ ok: true, message: "Logged out successfully" });
});

export default router;