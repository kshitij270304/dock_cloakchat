import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { Types } from "mongoose";

interface Credentials {
  userId?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",

      credentials: {
        userId: {
          label: "User ID",
          type: "text",
        },
      },

      async authorize(
        credentials: Credentials | undefined
      ): Promise<User | null> {
        console.log("================================");
        console.log("[NEXTAUTH] AUTHORIZE CALLED");
        console.log("Credentials:", credentials);
        console.log("================================");

        await dbConnect();

        if (!credentials?.userId) {
          console.log("[NEXTAUTH] Missing userId");
          throw new Error("Missing userId");
        }

        const user = await UserModel.findById(credentials.userId);

        console.log(
          "[NEXTAUTH] User Found:",
          user
            ? {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
              }
            : "NOT FOUND"
        );

        if (!user) {
          throw new Error("User not found");
        }

        console.log("[NEXTAUTH] Session Created");

        return {
          id: (user._id as Types.ObjectId).toString(),
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
        session.user._id = token._id as string;
        session.user.username = token.username as string;
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