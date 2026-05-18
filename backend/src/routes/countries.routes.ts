import { Router, Request, Response } from "express";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const countries: { id: string; name: string; cca2: string; region: string; subregion: string }[] =
    require("../data/countries.json");

const router = Router();

// GET /api/countries — returns the full country list for autocomplete and distance calculation
router.get("/", (_req: Request, res: Response) => {
    const list = countries
        .filter((c) => c.cca2 && c.cca2.length === 2)
        .map((c) => ({
            name: c.name,
            code: c.cca2.toLowerCase(),
            region: c.region,
            subregion: c.subregion,
        }));
    res.json(list);
});

export default router;
