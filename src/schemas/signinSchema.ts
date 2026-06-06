import {z} from "zod"

export const signInSchema = z.object({
    identifier: z.string(),
    password: z.string(),
})

export const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
    userId: z.string(),
})