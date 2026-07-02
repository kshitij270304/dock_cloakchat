"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptMessageSchema = void 0;
const zod_1 = require("zod");
exports.acceptMessageSchema = zod_1.z.object({
    acceptMessages: zod_1.z.boolean(),
});
