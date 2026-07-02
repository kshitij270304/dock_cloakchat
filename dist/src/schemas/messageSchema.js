"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = void 0;
const zod_1 = require("zod");
exports.MessageSchema = zod_1.z.object({
    content: zod_1.z
        .string()
        .min(10, { message: "content must be atleast of 10 characters" })
        .max(300, { message: "content must be atmost of 300 characters" })
});
