import { z } from "zod";
export const registerSchema = z.object({
    username: z
        .string()
        .min(3, "Username too short")
        .max(20, "Username too long")
        .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and _ allowed"),
    email: z
        .string()
        .email("Invalid email")
        .transform((val) => val.toLowerCase().trim()),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain uppercase letter")
        .regex(/[0-9]/, "Must contain number"),
});
