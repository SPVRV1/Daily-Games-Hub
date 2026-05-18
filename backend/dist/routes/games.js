import { Router } from "express";
export default function gamesRoutes(db) {
    const router = Router();
    const games = db.collection("games");
    // GET all active games
    router.get("/active", async (_req, res) => {
        try {
            const result = await games.find({ is_active: true }).toArray();
            res.json({
                ok: true,
                games: result,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch active games",
            });
        }
    });
    // GET all games
    router.get("/all", async (_req, res) => {
        try {
            const result = await games.find({}).toArray();
            res.json({
                ok: true,
                games: result,
            });
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch all games",
            });
        }
    });
    // GET game by id
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
        }
        catch (error) {
            res.status(500).json({
                ok: false,
                error: "Failed to fetch game",
            });
        }
    });
    return router;
}
