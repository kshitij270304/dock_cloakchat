"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.usernameValidation = void 0;
const zod_1 = require("zod");
exports.usernameValidation = zod_1.z
    .string()
    .min(2, "username must be ateast 2 character")
    .max(20, "not more than 20 char")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain speacial character");
exports.signUpSchema = zod_1.z.object({
    username: exports.usernameValidation,
    email: zod_1.z.string().email({ message: 'invalid email address' }),
    password: zod_1.z.string().min(6, { message: 'password must be atleast 6 char' })
});
