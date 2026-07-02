"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
exports.GET = GET;
const next_1 = require("next-auth/next");
const options_1 = require("../auth/[...nextauth]/options");
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
async function POST(request) {
    // Connect to the database
    await (0, dbConnect_1.default)();
    const session = await (0, next_1.getServerSession)(options_1.authOptions);
    const user = session?.user;
    if (!session || !session.user) {
        return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const userId = user._id;
    const { acceptMessages } = await request.json();
    try {
        // Update the user's message acceptance status
        const updatedUser = await User_model_1.default.findByIdAndUpdate(userId, { isAcceptingMessages: acceptMessages }, { new: true });
        if (!updatedUser) {
            // User not found
            return Response.json({
                success: false,
                message: 'Unable to find user to update message acceptance status',
            }, { status: 404 });
        }
        // Successfully updated message acceptance status
        return Response.json({
            success: true,
            message: 'Message acceptance status updated successfully',
            updatedUser,
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error updating message acceptance status:', error);
        return Response.json({ success: false, message: 'Error updating message acceptance status' }, { status: 500 });
    }
}
async function GET(request) {
    // Connect to the database
    await (0, dbConnect_1.default)();
    // Get the user session
    const session = await (0, next_1.getServerSession)(options_1.authOptions);
    const user = session?.user;
    // Check if the user is authenticated
    if (!session || !user) {
        return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    try {
        // Retrieve the user from the database using the ID
        const foundUser = await User_model_1.default.findById(user._id);
        if (!foundUser) {
            // User not found
            return Response.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        // Return the user's message acceptance status
        return Response.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages,
        }, { status: 200 });
    }
    catch (error) {
        console.error('Error retrieving message acceptance status:', error);
        return Response.json({ success: false, message: 'Error retrieving message acceptance status' }, { status: 500 });
    }
}
