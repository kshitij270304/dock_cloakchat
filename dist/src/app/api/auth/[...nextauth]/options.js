"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authOptions = void 0;
const credentials_1 = __importDefault(require("next-auth/providers/credentials"));
const dbConnect_1 = __importDefault(require("@/lib/dbConnect"));
const User_model_1 = __importDefault(require("@/model/User.model"));
exports.authOptions = {
    providers: [
        (0, credentials_1.default)({
            id: "credentials",
            name: "Credentials",
            credentials: {
                userId: {
                    label: "User ID",
                    type: "text",
                },
            },
            async authorize(credentials) {
                console.log("================================");
                console.log("[NEXTAUTH] AUTHORIZE CALLED");
                console.log("Credentials:", credentials);
                console.log("================================");
                await (0, dbConnect_1.default)();
                if (!credentials?.userId) {
                    console.log("[NEXTAUTH] Missing userId");
                    throw new Error("Missing userId");
                }
                const user = await User_model_1.default.findById(credentials.userId);
                console.log("[NEXTAUTH] User Found:", user
                    ? {
                        id: user._id.toString(),
                        username: user.username,
                        email: user.email,
                    }
                    : "NOT FOUND");
                if (!user) {
                    throw new Error("User not found");
                }
                console.log("[NEXTAUTH] Session Created");
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.username,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user.id;
                token.username = user.name ?? undefined;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user._id = token._id;
                session.user.username = token.username;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/sign-in",
    },
};
