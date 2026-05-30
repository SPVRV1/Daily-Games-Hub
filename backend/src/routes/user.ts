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
import multer from "multer";
import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "../db.js"; // prilagodi glede na tvoj db export

const router = Router();

router.get("/data", verifyToken, async (_req: AuthRequest, res) => {
    try {
        const _id = _req.userId;

        if (!_id) {
            return res.status(401).json({
                ok: false,
                error: "Unauthorized",
            });
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ _id }, {
            projection: {
                _id: 1,
                username: 1,
                email: 1,
                avatar_url: 1,
                current_streak: 1,
                longest_streak: 1,
                games_played: 1,
                num_achievements: 1,
                global_rank: 1,
                created_at: 1
            }
        });

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

router.get("/data/statistics", verifyToken, async (_req: AuthRequest, res) => {
    try {
        const _id = _req.userId;

        if (!_id) {
            return res.status(401).json({
                ok: false,
                error: "Unauthorized",
            });
        }

        const collection = await getUsersCollection();

        const user = await collection.findOne(
            { _id },
            {
                projection: {
                    games: 1,
                    achievements: 1
                }
            }
        );

        if (!user) {
            res.status(404).json({
                ok: false,
                error: "User not found",
            });
            return;
        }

        const games = user.games || [];

        // -----------------------------------------
        // TEDENSKA STATISTIKA (pon=0 ... ned=6)
        // -----------------------------------------

        const week = [0, 0, 0, 0, 0, 0, 0];

        const now = new Date();

        // izračun ponedeljka tekočega tedna
        const monday = new Date(now);

        const day = monday.getDay();
        // JS: ned=0, pon=1 ...
        const offset = day === 0 ? -6 : 1 - day;

        monday.setDate(monday.getDate() + offset);
        monday.setHours(0, 0, 0, 0);

        const nextMonday = new Date(monday);
        nextMonday.setDate(nextMonday.getDate() + 7);

        games.forEach(game => {

            if (!game.completed)
                return;

            const played = new Date(game.datePlayed);

            if (
                played >= monday &&
                played < nextMonday
            ) {
                let weekday = played.getDay();

                // JS: ned=0 -> 6
                weekday = weekday === 0
                    ? 6
                    : weekday - 1;

                week[weekday]++;
            }
        });

        // -----------------------------------------
        // STATISTIKA POSAMEZNIH IGER
        // -----------------------------------------

        const statsMap: Record<string, {
            totalAttempts: number;
            totalTime: number;
            gamesPlayed: number;
        }> = {};

        games.forEach(game => {

            if (!statsMap[game.title]) {
                statsMap[game.title] = {
                    totalAttempts: 0,
                    totalTime: 0,
                    gamesPlayed: 0
                };
            }

            statsMap[game.title].totalAttempts += game.attempts;
            statsMap[game.title].totalTime += game.timeTaken;
            statsMap[game.title].gamesPlayed++;
        });

        const gameStats = Object.entries(statsMap)
            .map(([title, data]) => ({
                title,

                averageAttempts:
                    Number(
                        (
                            data.totalAttempts /
                            data.gamesPlayed
                        ).toFixed(1)
                    ),

                averageTime:
                    Number(
                        (
                            data.totalTime /
                            data.gamesPlayed
                        ).toFixed(1)
                    ),

                gamesPlayed:
                    data.gamesPlayed
            }));

        res.json({
            ok: true,
            data: {
                week,
                games: gameStats,
                achievements:
                    user.achievements || []
            }
        });

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : "Unknown error";

        res.status(500).json({
            ok: false,
            error: message
        });
    }
});

router.post("/data/edit", verifyToken, async (req: AuthRequest, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ ok: false, error: "No token provided" });
        }

        const {
            username,
            email,
            avatar_url
        } = req.body;

        const _id = req.userId;

        if (!_id) {
            return res.status(401).json({
                ok: false,
                error: "Unauthorized",
            });
        }

        const userId = Number(_id);
        if (isNaN(userId)) {
            return res.status(400).json({
                ok: false,
                error: "Invalid ID"
            });
        }

        const updateFields: any = {};

        // posodobi samo poslana polja
        if (username !== undefined)
            updateFields.username = username;

        if (email !== undefined)
            updateFields.email = email;

        if (avatar_url !== undefined)
            updateFields.avatar_url = avatar_url;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                ok: false,
                error: "No fields to update"
            });
        }

        const collection = await getUsersCollection();

        updateFields.updatedAt = new Date();

        const result =
            await collection.updateOne(
                { _id: userId },
                {
                    $set: updateFields
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                ok: false,
                error: "User not found"
            });
        }

        return res.json({
            ok: true,
            message:
                "Profile updated successfully"
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unknown error";

        return res.status(500).json({
            ok: false,
            error: message
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
        const user = await collection.findOne({ username }, {
            projection: {
                _id: 1,
                username: 1,
                password_hash: 1
            }
        });

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
        const user = await collection.findOne({ email }, {
            projection: {
                _id: 1,
                password_hash: 1,
                email: 1,
                resetPasswordToken: 1,
                resetPasswordExpires: 1
            }
        });

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
            resetPasswordExpires: { $gt: new Date() }
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


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG and WebP images are allowed"));
        }
    }
});

router.post("/avatar/upload", verifyToken, upload.single("avatar"), async (req: AuthRequest, res) => {
    try {
        const _id = req.userId;

        if (!_id) {
            return res.status(401).json({ ok: false, error: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ ok: false, error: "No file provided" });
        }

        const db = await getDb();
        const bucket = new GridFSBucket(db, { bucketName: "avatars" });

        const userId = Number(_id);

        // Izbriši star avatar če obstaja
        const collection = await getUsersCollection();
        const user = await collection.findOne({ _id: userId });

        if (user?.avatar_file_id) {
            try {
                await bucket.delete(new ObjectId(user.avatar_file_id));
            } catch {
                // ignoriramo če datoteka ne obstaja
            }
        }

        // Shrani novo sliko
        const filename = `avatar_${userId}_${Date.now()}`;
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                userId,
                mimetype: req.file.mimetype
            }
        });

        await new Promise<void>((resolve, reject) => {
            uploadStream.on("finish", resolve);
            uploadStream.on("error", reject);
            uploadStream.end(req.file!.buffer);
        });

        const fileId = uploadStream.id.toString();

        // Shrani fileId v user dokument
        await collection.updateOne(
            { _id: userId },
            {
                $set: {
                    avatar_file_id: fileId,
                    avatar_url: `/user/avatar/${fileId}`, // opcijsko
                    updatedAt: new Date()
                }
            }
        );

        return res.status(201).json({
            ok: true,
            avatar_url: `/user/avatar/${fileId}`
        });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ ok: false, error: message });
    }
});

router.get("/avatar", verifyToken, async (req: AuthRequest, res) => {
    try {
        const _id = req.userId;

        if (!_id) {
            return res.status(401).json({ ok: false, error: "Unauthorized" });
        }

        const userId = Number(_id);
        if (isNaN(userId)) {
            return res.status(400).json({ ok: false, error: "Invalid ID" });
        }

        // Poišči avatar_file_id v user dokumentu
        const collection = await getUsersCollection();
        const user = await collection.findOne(
            { _id: userId },
            { projection: { avatar_file_id: 1 } }
        );

        if (!user) {
            return res.status(404).json({ ok: false, error: "User not found" });
        }

        if (!user.avatar_file_id) {
            return res.status(404).json({ ok: false, error: "No avatar uploaded" });
        }

        const fileId = user.avatar_file_id;

        if (!ObjectId.isValid(fileId)) {
            return res.status(400).json({ ok: false, error: "Invalid file ID" });
        }

        const db = await getDb();
        const bucket = new GridFSBucket(db, { bucketName: "avatars" });

        const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();

        if (!files.length) {
            return res.status(404).json({ ok: false, error: "Avatar not found" });
        }

        const mimetype = files[0].metadata?.mimetype ?? "image/jpeg";

        res.setHeader("Content-Type", mimetype);
        res.setHeader("Cache-Control", "public, max-age=86400");

        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on("error", () => {
            res.status(404).json({ ok: false, error: "File not found" });
        });

        downloadStream.pipe(res);

    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return res.status(500).json({ ok: false, error: message });
    }
});

export default router;