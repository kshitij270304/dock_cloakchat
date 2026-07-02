"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.generateOTP = generateOTP;
exports.getOTPExpiry = getOTPExpiry;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function getOTPExpiry() {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid for 10 minutes
    return expiry;
}
