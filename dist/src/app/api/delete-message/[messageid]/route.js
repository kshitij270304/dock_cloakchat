"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = DELETE;
const User_model_1 = __importDefault(require("@/model/User.model"));
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const next_1 = require("next-auth/next");
const options_1 = require("../../auth/[...nextauth]/options");
const server_1 = require("next/server");
async function DELETE(request, context) {
    // 👇 params must be awaited
    const { messageid } = await context.params;
    await (0, dbConnect_1.default)();
    const session = await (0, next_1.getServerSession)(options_1.authOptions);
    const user = session?.user;
    if (!session || !user) {
        return server_1.NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    try {
        const updateResult = await User_model_1.default.updateOne({ _id: user._id }, { $pull: { messages: { _id: messageid } } });
        if (updateResult.modifiedCount === 0) {
            return server_1.NextResponse.json({
                success: false,
                message: 'Message not found or already deleted',
            }, { status: 404 });
        }
        return server_1.NextResponse.json({ success: true, message: 'Message deleted' }, { status: 200 });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        return server_1.NextResponse.json({ success: false, message: 'Error deleting message' }, { status: 500 });
    }
}
