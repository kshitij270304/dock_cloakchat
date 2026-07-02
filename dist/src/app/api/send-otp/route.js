"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
const sendOTPEmail_1 = require("@/helpers/sendOTPEmail");
const utils_1 = require("@/lib/utils");
const redis_1 = require("@/lib/redis");
const ratelimiter_1 = require("@/lib/ratelimiter");
async function POST(request) {
    try {
        console.log("[send-otp] Starting OTP request");
        await (0, dbConnect_1.default)();
        console.log("[send-otp] Database connected");
        const { identifier, password } = await request.json();
        console.log("[send-otp] Credentials received for identifier:", identifier);
        if (!identifier || !password) {
            return server_1.NextResponse.json({
                success: false,
                message: "Email/Username and password are required",
            }, { status: 400 });
        }
        const user = await User_model_1.default.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user) {
            return server_1.NextResponse.json({
                success: false,
                message: "No user found with this email or username",
            }, { status: 401 });
        }
        // ============================
        // Redis Sliding Window Rate Limiter
        // Max 3 OTPs every 5 minutes
        // ============================
        try {
            await (0, ratelimiter_1.rateLimit)({
                identifier: user.email,
                prefix: "otp",
                limit: 3,
                window: 300,
            });
        }
        catch {
            return server_1.NextResponse.json({
                success: false,
                message: "Too many OTP requests. Please try again after 5 minutes.",
            }, { status: 429 });
        }
        if (!user.isVerified) {
            return server_1.NextResponse.json({
                success: false,
                message: "Please verify your account before logging in",
            }, { status: 403 });
        }
        const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordCorrect) {
            return server_1.NextResponse.json({
                success: false,
                message: "Incorrect password",
            }, { status: 401 });
        }
        console.log("[send-otp] Credentials verified, generating OTP");
        // Generate OTP
        const otp = (0, utils_1.generateOTP)();
        const otpExpiry = (0, utils_1.getOTPExpiry)();
        console.log("[send-otp] Generated OTP:", otp, "Expiry:", otpExpiry);
        console.log("[send-otp] User ID before save:", user._id.toString());
        // Save OTP to MongoDB
        user.twoFactorCode = otp;
        user.twoFactorCodeExpiry = otpExpiry;
        await user.save();
        console.log("[send-otp] OTP saved to database for user:", user._id.toString());
        // Cache OTP in Redis
        try {
            await (0, redis_1.setOTPInRedis)(user._id.toString(), otp, 600);
            console.log("[send-otp] OTP cached in Redis for user:", user._id.toString());
        }
        catch (redisError) {
            console.error("[send-otp] Redis caching failed (non-blocking):", redisError);
        }
        // Send OTP email
        console.log("[send-otp] Sending OTP email to", user.email);
        const emailResponse = await (0, sendOTPEmail_1.sendOTPEmail)(user.email, user.username, otp);
        if (!emailResponse.success) {
            console.error("[send-otp] Email sending failed:", emailResponse.message);
            return server_1.NextResponse.json({
                success: false,
                message: emailResponse.message,
            }, { status: 500 });
        }
        console.log("[send-otp] OTP sent successfully");
        return server_1.NextResponse.json({
            success: true,
            message: "OTP sent to your email",
            email: user.email,
            userId: user._id.toString(),
        }, { status: 200 });
    }
    catch (error) {
        console.error("[send-otp] Error:", error);
        return server_1.NextResponse.json({
            success: false,
            message: "Failed to send OTP",
        }, { status: 500 });
    }
}
