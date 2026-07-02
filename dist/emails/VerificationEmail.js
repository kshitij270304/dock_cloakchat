"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = VerificationEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function VerificationEmail({ username, otp }) {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { lang: "en", dir: "ltr", children: [(0, jsx_runtime_1.jsxs)(components_1.Head, { children: [(0, jsx_runtime_1.jsx)("title", { children: "Verification Code" }), (0, jsx_runtime_1.jsx)(components_1.Font, { fontFamily: "Roboto", fallbackFontFamily: "Verdana", webFont: {
                            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
                            format: 'woff2',
                        }, fontWeight: 400, fontStyle: "normal" })] }), (0, jsx_runtime_1.jsxs)(components_1.Preview, { children: ["Here's your verification code: ", otp] }), (0, jsx_runtime_1.jsxs)(components_1.Section, { children: [(0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsxs)(components_1.Heading, { as: "h2", children: ["Hello ", username, ","] }) }), (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsx)(components_1.Text, { children: "Thank you for registering. Please use the following verification code to complete your registration:" }) }), (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsx)(components_1.Text, { children: otp }) }), (0, jsx_runtime_1.jsx)(components_1.Row, { children: (0, jsx_runtime_1.jsx)(components_1.Text, { children: "If you did not request this code, please ignore this email." }) })] })] }));
}
