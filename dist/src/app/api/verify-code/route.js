"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
async function POST(request) {
    await (0, dbConnect_1.default)();
    try {
        const { username, code } = await request.json();
        if (!username || !code) {
            return Response.json({ success: false, message: "Username and code are required" }, { status: 400 });
        }
        const decodedUsername = decodeURIComponent(username.trim());
        const user = await User_model_1.default.findOne({ username: decodedUsername });
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = user.verifyCodeExpiry && user.verifyCodeExpiry.getTime() > Date.now();
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            user.verifyCode = undefined;
            user.verifyCodeExpiry = undefined;
            await user.save();
            return Response.json({ success: true, message: "Account verified successfully" }, { status: 200 });
        }
        if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code has expired. Please sign up again to get a new code.",
            }, { status: 400 });
        }
        return Response.json({ success: false, message: "Incorrect verification code" }, { status: 400 });
    }
    catch (error) {
        console.error("Error verifying user:", error);
        return Response.json({ success: false, message: "Error verifying user" }, { status: 500 });
    }
}
