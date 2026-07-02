"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifySchema = void 0;
const zod_1 = require("zod");
exports.verifySchema = zod_1.z.object({
    code: zod_1.z.string().length(6, 'verification code must be 6 digits')
});
