import { describe, it, expect, vi, beforeEach } from "vitest";
import { getTodayChallenge } from "../../controllers/game.controller.js";
import { Request, Response } from "express";

vi.mock("../../models/game.js", () => ({
    GameModel: {
        findOne: vi.fn(),
    },
}));

vi.mock("../../utils/gameHelpers.js", () => ({
    getTodayDate: vi.fn(() => "18-05-2026"),
}));

import { GameModel } from "../../models/game.js";

describe("Game Controller", () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockReq = {
            params: { gameType: "wordle" },
        };
        mockRes = {
            json: vi.fn(),
            status: vi.fn().mockReturnThis(),
        };
    });

    describe("getTodayChallenge", () => {
        it("should return 404 if game not found", async () => {
            (GameModel.findOne as any).mockResolvedValue(null);

            await getTodayChallenge(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "Game not found",
            });
        });

        it("should return 404 if no challenge for today", async () => {
            const mockGame = {
                name: "wordle",
                challenges: [{ date: "17-05-2026", challengeData: {} }],
            };
            (GameModel.findOne as any).mockResolvedValue(mockGame);

            await getTodayChallenge(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: "No challenge for today",
            });
        });

        it("should return the challenge for today if it exists", async () => {
            const mockChallenge = { text: "HELLO" };
            const mockGame = {
                name: "wordle",
                challenges: [
                    { date: "18-05-2026", challengeData: mockChallenge },
                ],
            };
            (GameModel.findOne as any).mockResolvedValue(mockGame);

            await getTodayChallenge(mockReq as Request, mockRes as Response);

            expect(mockRes.json).toHaveBeenCalledWith({
                gameType: "wordle",
                date: "18-05-2026",
                challengeData: mockChallenge,
            });
        });
    });
});
