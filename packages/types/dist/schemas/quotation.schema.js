"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQuotationSchema = exports.CreateQuotationSchema = void 0;
const zod_1 = require("zod");
// ========================
// Quotation DTOs
// ========================
exports.CreateQuotationSchema = zod_1.z.object({
    engineCodeName: zod_1.z.string().trim().min(1, { message: "Engine code name is required" }),
    dealershipName: zod_1.z.string().trim().min(1, { message: "Dealership name is required" }),
    quotationPrice: zod_1.z.number().positive({ message: "Quotation price must be positive" }),
    subject: zod_1.z.string().trim().min(1, { message: "Subject is required" }).max(200),
    message: zod_1.z.string().trim().min(1, { message: "Message is required" }),
    dealerId: zod_1.z.number().int().positive({ message: "Dealer ID is required" }),
});
// ------------------------------
exports.UpdateQuotationSchema = exports.CreateQuotationSchema.partial();
