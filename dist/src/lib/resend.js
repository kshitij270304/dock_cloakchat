"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResendClient = getResendClient;
const resend_1 = require("resend");
function getResendClient() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured");
    }
    return new resend_1.Resend(apiKey);
}
