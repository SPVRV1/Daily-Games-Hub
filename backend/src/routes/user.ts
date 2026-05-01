import { Router } from "express";
import { getUsersCollection } from "../db.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = Router();

//router.get("/data", verifyToken, async (_req: AuthRequest, res) => {
router.get("/data", async (_req, res) => {
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

export default router;