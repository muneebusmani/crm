"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAdminSchema = exports.CreateAdminSchema = void 0;
const zod_1 = __importDefault(require("zod"));
// ================
// Admin DTOs
// ================
exports.CreateAdminSchema = zod_1.default.object({
    name: zod_1.default.string()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .trim(),
    email: zod_1.default.email({ message: "Invalid email address" }),
    username: zod_1.default.string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(30, { message: "Username cannot exceed 30 characters" })
        .trim(),
    password: zod_1.default.string()
        .min(6, { message: "Password must be at least 6 characters" })
        .trim(),
    role: zod_1.default.string().trim(),
    adminRoleId: zod_1.default.number().optional(),
});
// ------------------------------
exports.UpdateAdminSchema = exports.CreateAdminSchema.partial();
