"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
const redis_1 = require("@/lib/redis");
async function POST(request) {
    try {
        await (0, dbConnect_1.default)();
        console.log("\n========================================");
        console.log("[verify-otp] DATABASE CONNECTED");
        console.log("========================================\n");
        const { userId, otp } = await request.json();
        console.log("[verify-otp] Request Data:");
        console.log("User ID:", userId);
        console.log("Entered OTP:", otp);
        console.log("Entered OTP Type:", typeof otp);
        console.log("Entered OTP Length:", otp?.length);
        if (!userId || !otp) {
            console.log("[verify-otp] Missing userId or otp");
            return server_1.NextResponse.json({
                success: false,
                message: "User ID and OTP are required",
            }, { status: 400 });
        }
        const user = await User_model_1.default.findById(userId);
        console.log("\n========================================");
        console.log("[verify-otp] USER LOOKUP");
        console.log("========================================");
        if (!user) {
            console.log("[verify-otp] USER NOT FOUND");
            return server_1.NextResponse.json({
                success: false,
                message: "User not found",
            }, { status: 404 });
        }
        console.log("User Found:", user.username);
        console.log("Email:", user.email);
        console.log("Mongo ID:", user._id.toString());
        console.log("\n========================================");
        console.log("[verify-otp] CHECKING REDIS CACHE");
        console.log("========================================");
        let storedOtp = null;
        let isFromRedis = false;
        try {
            storedOtp = await (0, redis_1.getOTPFromRedis)(userId);
            if (storedOtp) {
                isFromRedis = true;
                console.log("[verify-otp] OTP retrieved from Redis cache");
            }
        }
        catch (redisError) {
            console.error("[verify-otp] Redis retrieval failed, falling back to database:", redisError);
        }
        // Fallback to database if not found in Redis
        if (!storedOtp) {
            console.log("[verify-otp] OTP not in Redis, checking database...");
            // user.twoFactorCode is string | null; storedOtp is string | null, so default to null
            storedOtp = user.twoFactorCode ?? null;
            console.log("Stored OTP from Database:", storedOtp);
        }
        console.log("\n========================================");
        console.log("[verify-otp] OTP DATA");
        console.log("========================================");
        console.log("OTP Source:", isFromRedis ? "Redis" : "Database");
        console.log("Stored OTP:", storedOtp);
        console.log("Stored OTP Type:", typeof storedOtp);
        console.log("Stored OTP Length:", storedOtp?.length);
        if (isFromRedis) {
            console.log("OTP Exists in Redis?:", !!storedOtp);
        }
        else {
            console.log("OTP Exists in Database?:", !!user.twoFactorCode);
            console.log("Expiry Exists?:", !!user.twoFactorCodeExpiry);
        }
        console.log("\n========================================");
        // Check if OTP exists
        if (!storedOtp) {
            console.log("[verify-otp] OTP NOT FOUND");
            return server_1.NextResponse.json({
                success: false,
                message: "OTP not found. Please request a new one.",
            }, { status: 400 });
        }
        // Check expiry (only for database OTP, Redis automatically expires)
        if (!isFromRedis && user.twoFactorCodeExpiry) {
            console.log("\n========================================");
            console.log("[verify-otp] EXPIRY CHECK");
            console.log("========================================");
            console.log("Current Time:", new Date().toISOString());
            console.log("Expiry Time:", user.twoFactorCodeExpiry);
            console.log("Expired?:", new Date() > user.twoFactorCodeExpiry);
            if (new Date() > user.twoFactorCodeExpiry) {
                console.log("[verify-otp] OTP EXPIRED");
                user.twoFactorCode = undefined;
                user.twoFactorCodeExpiry = undefined;
                await user.save();
                return server_1.NextResponse.json({
                    success: false,
                    message: "OTP has expired. Please request a new one.",
                }, { status: 400 });
            }
        }
        console.log("\n========================================");
        console.log("[verify-otp] OTP COMPARISON");
        console.log("========================================");
        const receivedOtp = otp?.trim();
        console.log("Stored OTP:", storedOtp?.trim());
        console.log("Received OTP:", receivedOtp);
        console.log("OTP Match?:", storedOtp?.trim() === receivedOtp);
        if (storedOtp?.trim() !== receivedOtp) {
            console.log("[verify-otp] OTP MISMATCH");
            return server_1.NextResponse.json({
                success: false,
                message: "Invalid OTP",
            }, { status: 401 });
        }
        console.log("\n========================================");
        console.log("[verify-otp] OTP VERIFIED");
        console.log("========================================");
        console.log("Clearing OTP from both Redis and Database...");
        // Clear from Redis
        try {
            await (0, redis_1.deleteOTPFromRedis)(userId);
            console.log("[verify-otp] OTP deleted from Redis");
        }
        catch (redisError) {
            console.error("[verify-otp] Redis deletion failed (non-blocking):", redisError);
        }
        // Clear from Database
        console.log("Before Clear OTP:", user.twoFactorCode);
        console.log("Before Clear Expiry:", user.twoFactorCodeExpiry);
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpiry = undefined;
        await user.save();
        console.log("OTP Cleared Successfully");
        return server_1.NextResponse.json({
            success: true,
            message: "OTP verified successfully. You can now log in.",
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
        }, { status: 200 });
    }
    catch (error) {
        console.log("\n========================================");
        console.log("[verify-otp] FATAL ERROR");
        console.log("========================================");
        console.error(error);
        return server_1.NextResponse.json({
            success: false,
            message: "Failed to verify OTP",
        }, { status: 500 });
    }
}
