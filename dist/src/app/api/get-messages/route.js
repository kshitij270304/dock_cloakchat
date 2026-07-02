"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const next_1 = require("next-auth/next");
const options_1 = require("../auth/[...nextauth]/options");
async function GET(request) {
    await (0, dbConnect_1.default)();
    const session = await (0, next_1.getServerSession)(options_1.authOptions);
    const _user = session?.user;
    if (!session || !_user) {
        return Response.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }
    const userId = new mongoose_1.default.Types.ObjectId(_user._id);
    try {
        const user = await User_model_1.default.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec();
        if (!user || user.length === 0) {
            return Response.json({ message: 'User not found', success: false }, { status: 404 });
        }
        return Response.json({ messages: user[0].messages }, {
            status: 200,
        });
    }
    catch (error) {
        console.error('An unexpected error occurred:', error);
        return Response.json({ message: 'Internal server error', success: false }, { status: 500 });
    }
}
