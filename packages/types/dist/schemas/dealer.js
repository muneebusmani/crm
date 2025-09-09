"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDealerSchema = exports.CreateDealerSchema = void 0;
const zod_1 = require("zod");
// ================
// Dealer DTOs
// ================
exports.CreateDealerSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .trim()
        .min(1, { message: "Name is required" }), // prevents empty after trim
    email: zod_1.z.email({ message: "Invalid email address" }),
    username: zod_1.z.string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(30, { message: "Username cannot exceed 30 characters" })
        .trim()
        .min(1, { message: "Username is required" }),
    password: zod_1.z.string()
        .min(6, { message: "Password must be at least 6 characters" })
        .trim()
        .min(1, { message: "Password is required" }),
    owner: zod_1.z.string()
        .trim()
        .min(1, { message: "Owner name is required" }),
    location: zod_1.z.string()
        .trim()
        .min(1, { message: "Location is required" }),
    logo: zod_1.z.string()
        .trim()
        .min(1, { message: "Logo URL is required" }),
    website: zod_1.z
        .url({ message: "Must be a valid URL" })
        .trim(),
    contactEmail: zod_1.z.email({ message: "Invalid contact email address" }),
    tierId: zod_1.z.number().optional(),
});
zod_1.z.url();
// ------------------------------
exports.UpdateDealerSchema = exports.CreateDealerSchema.partial();
