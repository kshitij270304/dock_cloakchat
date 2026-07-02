"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.default = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
const jwt_1 = require("next-auth/jwt");
var middleware_1 = require("next-auth/middleware");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(middleware_1).default; } });
exports.config = {
    matcher: ['/dashboard/:path*', '/sign-in', '/sign-up', '/', '/verify/:path*'],
};
async function middleware(request) {
    const token = await (0, jwt_1.getToken)({ req: request });
    const url = request.nextUrl;
    if (token &&
        (url.pathname.startsWith('/sign-in') ||
            url.pathname.startsWith('/sign-up') ||
            url.pathname.startsWith('/verify') ||
            url.pathname === '/')) {
        return server_1.NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (!token && url.pathname.startsWith('/dashboard')) {
        return server_1.NextResponse.redirect(new URL('/sign-in', request.url));
    }
    return server_1.NextResponse.next();
}
