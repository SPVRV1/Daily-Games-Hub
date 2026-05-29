import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyToken, AuthRequest } from "../../middleware/auth.js";
import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

vi.mock("../../utils/auth.js", () => ({
    isBlacklisted: vi.fn(),
}));

import { isBlacklisted } from "../../utils/auth.js";

describe("Auth Middleware (verifyToken)", () => {
    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();
        mockReq = {
            headers: {},
        };
        mockRes = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        mockNext = vi.fn();
    });

    it("should return 401 if no token is provided", () => {
        verifyToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            ok: false,
            error: "No token provided",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is blacklisted", () => {
        mockReq.headers = { authorization: "Bearer blacklisted-token" };
        (isBlacklisted as any).mockReturnValue(true);

        verifyToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            ok: false,
            error: "Token has been invalidated",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 if token is invalid (jwt verification fails)", () => {
        mockReq.headers = { authorization: "Bearer invalid-token" };
        (isBlacklisted as any).mockReturnValue(false);

        vi.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("invalid signature");
        });

        verifyToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            ok: false,
            error: "Invalid token",
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next() and assign decoded user to req if token is valid", () => {
        mockReq.headers = { authorization: "Bearer valid-token" };
        (isBlacklisted as any).mockReturnValue(false);

        const decodedUser = { userId: 123 };
        vi.spyOn(jwt, "verify").mockImplementation(() => decodedUser);

        verifyToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.user).toEqual(decodedUser);
        expect(mockRes.status).not.toHaveBeenCalled();
    });
});
