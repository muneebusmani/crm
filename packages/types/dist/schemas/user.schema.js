"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema = exports.CreateUserSchema = void 0;
// packages/schemas/src/user.schema.ts
const __1 = require("../");
const zod_1 = require("zod");
// Base schema for creating a user (exclude id and relations)
exports.CreateUserSchema = zod_1.z.object({
    email: zod_1.z.email({ message: 'Invalid email' }),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(1, 'Name is required'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    type: zod_1.z.enum(__1.UserType).default(__1.UserType.DEALER),
});
// Optional: Schema for updating a user (all fields optional)
exports.UpdateUserSchema = exports.CreateUserSchema.partial();
