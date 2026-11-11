import { z } from "zod";

export const UserSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .trim()
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    email: z.string()
        .email("Must be a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email must be at most 100 characters")
        .trim()
        .toLowerCase()
        .refine((val) => !val.startsWith(".") && !val.endsWith(".") && !val.includes(".."), {
            message: "Email cannot contain leading, trailing, or consecutive dots"
        })
        .refine((val) => {
            const domain = val.split("@")[1];
            return domain && domain.includes(".") && (domain.split(".").pop()?.length ?? 0) >= 2;
        }, {
            message: "Email domain must include a valid top-level domain"
        }),
    password: z.string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be at most 100 characters")
        .trim()
});

export const UserSignupSchema = UserSchema.extend({
    code: z.string().length(6, "Verification code must be 6 digits")
});

export const ProfileUpdateSchema = z.object({
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must be at most 30 characters")
        .trim()
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
        .optional(),
    email: z.string()
        .email("Must be a valid email address")
        .min(5, "Email must be at least 5 characters")
        .max(100, "Email must be at most 100 characters")
        .trim()
        .toLowerCase()
        .refine((val) => !val.startsWith(".") && !val.endsWith(".") && !val.includes(".."), {
            message: "Email cannot contain leading, trailing, or consecutive dots"
        })
        .refine((val) => {
            const domain = val.split("@")[1];
            return domain && domain.includes(".") && (domain.split(".").pop()?.length ?? 0) >= 2;
        }, {
            message: "Email domain must include a valid top-level domain"
        })
        .optional(),
    avatar: z.string().max(2000000, "Avatar payload exceeds size limit").optional()
});
