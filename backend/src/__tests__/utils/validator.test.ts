import { describe, it, expect } from "vitest";
import { registerSchema } from "../../utils/validator.js";

describe("Validator Utils", () => {
    describe("registerSchema", () => {
        it("should validate and parse a valid payload", () => {
            const validData = {
                username: "johndoe",
                email: "JOHN@EXAMPLE.COM",
                password: "Password123",
            };

            const result = registerSchema.safeParse(validData);
            if (!result.success) {
                console.error(result.error);
            }
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.email).toBe("john@example.com");
            }
        });

        it("should fail on invalid username", () => {
            const resultShort = registerSchema.safeParse({
                username: "jo",
                email: "test@example.com",
                password: "Password123",
            });
            expect(resultShort.success).toBe(false);

            const resultChars = registerSchema.safeParse({
                username: "john doe!",
                email: "test@example.com",
                password: "Password123",
            });
            expect(resultChars.success).toBe(false);
        });

        it("should fail on invalid password", () => {
            const noUpper = registerSchema.safeParse({
                username: "johndoe",
                email: "test@example.com",
                password: "password123",
            });
            expect(noUpper.success).toBe(false);

            const noNumber = registerSchema.safeParse({
                username: "johndoe",
                email: "test@example.com",
                password: "Password",
            });
            expect(noNumber.success).toBe(false);

            const tooShort = registerSchema.safeParse({
                username: "johndoe",
                email: "test@example.com",
                password: "Pas1",
            });
            expect(tooShort.success).toBe(false);
        });
    });
});
