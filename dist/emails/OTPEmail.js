"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OTPEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
function OTPEmail({ username, otp }) {
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            fontFamily: 'Arial, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f4f4f4',
            borderRadius: '8px',
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                backgroundColor: '#ffffff',
                padding: '30px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }, children: [(0, jsx_runtime_1.jsx)("h1", { style: {
                        color: '#333333',
                        fontSize: '28px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                    }, children: "Two-Factor Authentication" }), (0, jsx_runtime_1.jsxs)("p", { style: {
                        color: '#666666',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                    }, children: ["Hi ", username, ","] }), (0, jsx_runtime_1.jsx)("p", { style: {
                        color: '#666666',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        marginBottom: '30px',
                    }, children: "Your One-Time Password (OTP) for logging into Cloak Chat is:" }), (0, jsx_runtime_1.jsx)("div", { style: {
                        backgroundColor: '#f9f9f9',
                        border: '2px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        marginBottom: '30px',
                    }, children: (0, jsx_runtime_1.jsx)("p", { style: {
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#0ea5e9',
                            letterSpacing: '4px',
                            margin: '0',
                        }, children: otp }) }), (0, jsx_runtime_1.jsxs)("p", { style: {
                        color: '#999999',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        marginBottom: '20px',
                    }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "This OTP is valid for 10 minutes." }), " Please do not share this code with anyone."] }), (0, jsx_runtime_1.jsx)("p", { style: {
                        color: '#666666',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        marginBottom: '30px',
                    }, children: "If you didn't request this OTP, please ignore this email or contact our support team." }), (0, jsx_runtime_1.jsx)("div", { style: {
                        borderTop: '1px solid #eeeeee',
                        paddingTop: '20px',
                        textAlign: 'center',
                        color: '#999999',
                        fontSize: '12px',
                    }, children: (0, jsx_runtime_1.jsx)("p", { style: { margin: '0' }, children: "\u00A9 2024 Cloak Chat. All rights reserved." }) })] }) }));
}
