import { describe, it, expect } from "vitest";
import { getTodayDate } from "../../utils/gameHelpers.ts";

describe("Game Helpers", () => {
    describe("getTodayDate", () => {
        it("should return the correct format for today's date (DD-MM-YYYY)", () => {
            const dateStr = getTodayDate();

            expect(dateStr).toMatch(/^\d{2}-\d{2}-\d{4}$/);

            const [day, month, year] = dateStr.split("-");
            expect(parseInt(day)).toBeGreaterThanOrEqual(1);
            expect(parseInt(day)).toBeLessThanOrEqual(31);

            expect(parseInt(month)).toBeGreaterThanOrEqual(0);
            expect(parseInt(month)).toBeLessThanOrEqual(11);

            expect(parseInt(year)).toBeGreaterThanOrEqual(2023);
        });
    });
});
