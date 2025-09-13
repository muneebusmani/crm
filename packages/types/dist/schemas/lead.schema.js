"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeadSchema = exports.CreateLeadSchema = void 0;
const zod_1 = require("zod");
// ================
// Lead DTOs
// ================
exports.CreateLeadSchema = zod_1.z.object({
    vehicle_model: zod_1.z.string()
        .trim()
        .min(1, { message: "Vehicle model is required" })
        .max(100, { message: "Vehicle model cannot exceed 100 characters" })
        .optional(),
    vehicle_reg: zod_1.z.string()
        .trim()
        .min(1, { message: "Vehicle registration is required" })
        .max(20, { message: "Vehicle registration cannot exceed 20 characters" })
        .optional(),
    vehicle_brand: zod_1.z.string().trim().optional(),
    vehicle_title: zod_1.z.string().trim().optional(),
    vehicle_vrm: zod_1.z.string().trim().optional(),
    vehicle_series: zod_1.z.string().trim().optional(),
    vehicle_part: zod_1.z.string().trim().optional(),
    engin_capacity: zod_1.z.string().trim().optional(),
    fuelType: zod_1.z.string().trim().optional(),
    part_supplied: zod_1.z.string().trim().optional(),
    supply_only: zod_1.z.boolean().optional(),
    consider_both: zod_1.z.boolean().optional(),
    reconditioned_condition: zod_1.z.string().trim().optional(),
    used_condition: zod_1.z.string().trim().optional(),
    new_condition: zod_1.z.string().trim().optional(),
    consider_all_condition: zod_1.z.boolean().optional(),
    postcode: zod_1.z.string()
        .trim()
        .regex(/^[A-Za-z0-9 ]+$/, { message: "Invalid postcode format" })
        .optional(),
    vehicle_drive: zod_1.z.string().trim().optional(),
    collection_required: zod_1.z.boolean().optional(),
    email: zod_1.z.string()
        .email({ message: "Invalid email address" })
        .optional(),
    name: zod_1.z.string()
        .trim()
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name cannot exceed 50 characters" })
        .optional(),
    number: zod_1.z.string()
        .trim()
        .regex(/^\+?[0-9]{7,15}$/, { message: "Invalid phone number" })
        .optional(),
    description: zod_1.z.string().trim().optional(),
    engine_code: zod_1.z.string().trim().optional(),
});
// ------------------------------
exports.UpdateLeadSchema = exports.CreateLeadSchema.partial();
