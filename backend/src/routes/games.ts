import { Router } from "express";
import type { Db } from "mongodb";

type Game = {
    game_id: number;
    name: string;
    description?: string;
    puzzle_table: string;
    max_attempts?: number | null;
    time_limit_seconds?: number | null;
    is_active: boolean;
};

export default function gamesRoutes(db: Db) {
    const router = Router();
    const games = db.collection<Game>("games");

    //GET all active games
    router.get("/", async (_req, res) => {
        try {
            const result = await games
                .find({ is_active: true })
                .toArray();

            res.json({
                ok: true,
                games: result,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch games",
            });
        }
    });

    //GET game by id
    router.get("/:id", async (req, res) => {
        try {
            const id = Number(req.params.id);

            if (Number.isNaN(id)) {
                return res.status(400).json({
                    ok: false,
                    error: "Invalid game id",
                });
            }

            const game = await games.findOne({ game_id: id });

            if (!game) {
                return res.status(404).json({
                    ok: false,
                    error: "Game not found",
                });
            }

            res.json({
                ok: true,
                game,
            });
        } catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch game",
            });
        }
    });

    return router;
}