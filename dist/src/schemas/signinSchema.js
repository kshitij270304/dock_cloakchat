"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpSchema = exports.signInSchema = void 0;
const zod_1 = require("zod");
exports.signInSchema = zod_1.z.object({
    identifier: zod_1.z.string(),
    password: zod_1.z.string(),
});
exports.otpSchema = zod_1.z.object({
    otp: zod_1.z.string().length(6, "OTP must be 6 digits"),
    userId: zod_1.z.string(),
});
