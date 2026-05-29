import { describe, expect, it } from "vitest";
import {
    generateWorldleChallenge,
    WORLDLE_VALID_COUNTRIES,
} from "../../utils/worldle.js";

describe("Worldle utils", () => {
    it("generates a stable challenge with the expected payload shape", () => {
        const first = generateWorldleChallenge("18-05-2026");
        const second = generateWorldleChallenge("18-05-2026");

        expect(first).toEqual(second);
        expect(first.gameType).toBe("worldle");
        expect(first.date).toBe("18-05-2026");
        expect(typeof first.challengeData.answer).toBe("string");
        expect(WORLDLE_VALID_COUNTRIES).toContain(first.challengeData.answer);
        expect(first.challengeData.validCountries.length).toBeGreaterThan(100);
        expect(first.challengeData.validCountries).toContain(
            first.challengeData.answer,
        );
        expect(first.challengeData.silhouette.length).toBeGreaterThan(0);
        expect(first.challengeData.challengeId).toBe("worldle-18-05-2026");
    });
});
