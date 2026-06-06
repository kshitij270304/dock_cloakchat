import { getResendClient } from "@/lib/resend";
import OTPEmail from "../../emails/OTPEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendOTPEmail(
  email: string,
  username: string,
  otp: string
): Promise<ApiResponse> {
  try {
    console.log("[sendOTPEmail] Starting to send OTP to:", email);

    console.log("[sendOTPEmail] Getting Resend client...");
    const resend = getResendClient();
    console.log("[sendOTPEmail] Resend client initialized");

    console.log("[sendOTPEmail] Generating email template...");
    const emailContent = OTPEmail({ username, otp });
    console.log("[sendOTPEmail] Email template generated");

    console.log("[sendOTPEmail] Sending email via Resend...");

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your Two-Factor Authentication Code",
      react: emailContent,
    });

    console.log(
      "[sendOTPEmail] Full Resend response:",
      JSON.stringify(response, null, 2)
    );

    // Check for API errors
    if (response.error) {
      console.error(
        "[sendOTPEmail] Resend API error:",
        response.error
      );

      return {
        success: false,
        message:
          response.error.message ||
          "Failed to send OTP email",
      };
    }

    // Check successful response
    if (!response.data?.id) {
      console.error(
        "[sendOTPEmail] Missing email ID in response:",
        response
      );

      return {
        success: false,
        message: "No email ID returned by Resend",
      };
    }

    console.log(
      "[sendOTPEmail] Email sent successfully. ID:",
      response.data.id
    );

    return {
      success: true,
      message: "OTP sent to your email successfully.",
    };
  } catch (error) {
    console.error(
      "[sendOTPEmail] Exception caught:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unknown error occurred while sending OTP",
    };
  }
}