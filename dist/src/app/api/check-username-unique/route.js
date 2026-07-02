"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
const zod_1 = require("zod");
const signUpSchema_1 = require("@/schemas/signUpSchema");
const UsernameQuerySchema = zod_1.z.object({
    username: signUpSchema_1.usernameValidation,
});
async function GET(request) {
    await (0, dbConnect_1.default)();
    try {
        const { searchParams } = new URL(request.url);
        const queryParams = {
            username: searchParams.get('username'),
        };
        const result = UsernameQuerySchema.safeParse(queryParams);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : 'Invalid query parameters',
            }, { status: 400 });
        }
        const { username } = result.data;
        const existingVerifiedUser = await User_model_1.default.findOne({
            username,
            isVerified: true,
        });
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: 'Username is already taken',
            }, { status: 200 });
        }
        return Response.json({
            success: true,
            message: 'Username is unique',
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error checking username:', error);
        return Response.json({
            success: false,
            message: 'Error checking username',
        }, { status: 500 });
    }
}
