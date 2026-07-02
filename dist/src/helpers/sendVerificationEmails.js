"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = sendVerificationEmail;
const resend_1 = require("@/lib/resend");
const VerificationEmail_1 = __importDefault(require("../../emails/VerificationEmail"));
async function sendVerificationEmail(email, username, verifyCode) {
    try {
        const resend = (0, resend_1.getResendClient)(); // ✅ runtime-only
        const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Mystery Message Verification Code",
            react: (0, VerificationEmail_1.default)({ username, otp: verifyCode }),
        });
        console.log("Resend API success:", response);
        return {
            success: true,
            message: "Verification email sent successfully.",
        };
    }
    catch (error) {
        console.error("Resend API error:", error);
        return {
            success: false,
            message: "Failed to send verification email.",
        };
    }
}
