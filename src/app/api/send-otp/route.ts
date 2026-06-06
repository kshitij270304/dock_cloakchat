import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User.model";
import { sendOTPEmail } from "@/helpers/sendOTPEmail";
import { generateOTP, getOTPExpiry } from "@/lib/utils";
import { setOTPInRedis } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    console.log("[send-otp] Starting OTP request");
    
    await dbConnect();
    console.log("[send-otp] Database connected");

    const { identifier, password } = await request.json();
    console.log("[send-otp] Credentials received for identifier:", identifier);

    if (!identifier || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email/Username and password are required",
        },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No user found with this email or username",
        },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message: "Please verify your account before logging in",
        },
        { status: 403 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password",
        },
        { status: 401 }
      );
    }

    console.log("[send-otp] Credentials verified, generating OTP");

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    console.log("[send-otp] Generated OTP:", otp, "Expiry:", otpExpiry);
    console.log("[send-otp] User ID before save:", user._id.toString());

    // Save OTP to database (twoFactorCode for login verification)
    user.twoFactorCode = otp;
    user.twoFactorCodeExpiry = otpExpiry;

    await user.save();
    console.log("[send-otp] OTP saved to database for user:", user._id.toString());
    console.log("[send-otp] Verified save - twoFactorCode:", user.twoFactorCode, "Expiry:", user.twoFactorCodeExpiry);

    // Cache OTP in Redis (10 minutes expiry)
    try {
      await setOTPInRedis(user._id.toString(), otp, 600);
      console.log("[send-otp] OTP cached in Redis for user:", user._id.toString());
    } catch (redisError) {
      console.error("[send-otp] Redis caching failed (non-blocking):", redisError);
      // Continue even if Redis caching fails, since we have MongoDB as fallback
    }

    // Send OTP via email
    console.log("[send-otp] Sending OTP email to", user.email);
    const emailResponse = await sendOTPEmail(user.email, user.username, otp);
    
        if (!emailResponse.success) {
    console.error("[send-otp] Email sending failed:", emailResponse.message);

    return NextResponse.json(
        {
        success: false,
        message: emailResponse.message,
        },
        { status: 500 }
    );
    }

    console.log("[send-otp] OTP sent successfully");

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent to your email",
        email: user.email,
        userId: user._id.toString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP",
      },
      { status: 500 }
    );
  }
}
