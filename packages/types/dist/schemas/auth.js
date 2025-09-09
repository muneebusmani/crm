"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
// ================
// AUTH DTOs
// ================
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.email({ message: "Invalid email address" }),
    password: zod_1.z.string().min(6, { message: "Password must be at least 6 characters" }),
});
// ----------------
exports.RegisterSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .trim(),
    email: zod_1.z.email({ message: "Invalid email address" }),
    username: zod_1.z.string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(30, { message: "Username cannot exceed 30 characters" })
        .trim(),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters" })
        .trim(),
});
