"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const User_model_1 = __importDefault(require("@/model/User.model"));
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
/**
 * @deprecated This endpoint is kept for backward compatibility.
 * Please use WebSocket connection for real-time message sending.
 *
 * WebSocket Usage:
 * import { sendMessageViaSocket } from '@/lib/socketIO';
 * await sendMessageViaSocket(username, content, sender);
 */
async function POST(request) {
    await (0, dbConnect_1.default)();
    // 👇 now also receive "sender"
    const { username, content, sender } = await request.json();
    try {
        // Validate input
        if (!username || !content) {
            return Response.json({ message: 'Username and content are required', success: false }, { status: 400 });
        }
        const user = await User_model_1.default.findOne({ username }).exec();
        if (!user) {
            return Response.json({ message: 'User not found', success: false }, { status: 404 });
        }
        if (!user.isAcceptingMessages) {
            return Response.json({ message: 'User is not accepting messages', success: false }, { status: 403 });
        }
        // 👇 include sender when creating a new message
        const newMessage = {
            content,
            createdAt: new Date(),
            // sender: sender || 'Anonymous',  // Fallback if sender not provided
        };
        user.messages.push(newMessage);
        await user.save({ validateBeforeSave: false });
        return Response.json({
            message: 'Message sent successfully (REST fallback - use WebSocket for real-time updates)',
            success: true,
            data: newMessage
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error adding message:', error);
        return Response.json({ message: 'Internal server error', success: false }, { status: 500 });
    }
}
