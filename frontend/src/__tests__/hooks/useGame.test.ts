import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGame } from "../../hooks/useGame.ts";

describe("useGame Hook", () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        global.fetch = vi.fn();
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: vi.fn(() => "mock-token"),
                setItem: vi.fn(),
                removeItem: vi.fn(),
            },
            writable: true,
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.clearAllMocks();
    });

    it("should initialize and set state to already_played if user played today", async () => {
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ played: true, result: { score: 100 } }),
        });

        const { result } = renderHook(() => useGame("wordle"));

        expect(result.current.state.status).toBe("loading");

        await waitFor(() => {
            expect(result.current.state.status).toBe("already_played");
        });

        expect(result.current.state.result).toEqual({ score: 100 });
        expect(result.current.state.challenge).toBeNull();
    });

    it("should set state to playing and load challenge if user has not played today", async () => {
        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ played: false }),
        });

        (global.fetch as any).mockResolvedValueOnce({
            json: async () => ({ challengeData: "TEST" }),
        });

        const { result } = renderHook(() => useGame("wordle"));

        await waitFor(() => {
            expect(result.current.state.status).toBe("playing");
        });

        expect(result.current.state.challenge).toEqual({
            challengeData: "TEST",
        });
        expect(result.current.state.result).toBeNull();
    });
});
