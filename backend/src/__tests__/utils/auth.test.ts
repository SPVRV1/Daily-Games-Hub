import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    addToBlacklist,
    isBlacklisted,
    hashPassword,
    comparePassword,
    generateToken,
} from "../../utils/auth.ts";

describe("Auth Utils", () => {
    describe("Token Blacklist", () => {
        it("should add token to blacklist and verify it is blacklisted", () => {
            const token = "test.jwt.token";
            expect(isBlacklisted(token)).toBe(false);
            addToBlacklist(token);
            expect(isBlacklisted(token)).toBe(true);
        });
    });

    describe("Password Hashing", () => {
        it("should hash a password and compare it successfully", async () => {
            const password = "Password123!";
            const hash = await hashPassword(password);

            expect(hash).not.toBe(password);

            const isMatch = await comparePassword(password, hash);
            expect(isMatch).toBe(true);

            const isWrongMatch = await comparePassword(
                "WrongPassword123!",
                hash,
            );
            expect(isWrongMatch).toBe(false);
        });
    });

    describe("Generate Token", () => {
        it("should generate a valid JWT token", () => {
            const token = generateToken(123);
            expect(typeof token).toBe("string");
            expect(token.split(".").length).toBe(3);
        });
    });
});
