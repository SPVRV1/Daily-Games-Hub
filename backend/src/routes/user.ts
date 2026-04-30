import { Router } from "express";
import { getUsersCollection } from "../db.js";
import { User } from "../models/user.js";

const router = Router();

router.get("/data", async (_req, res) => {
    try {
        const { username: _username } = _req.query;

        if (!_username || typeof _username !== "string") {
            res.status(400).json({
                ok: false,
                error: "Username query parameter is required",
            });
            return;
        }

        const collection = await getUsersCollection();
        const user = await collection.findOne({ username: _username });

        console.log(typeof user);

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

export default router;