"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const next_1 = __importDefault(require("next-auth/next"));
const options_1 = require("./options");
const handler = (0, next_1.default)(options_1.authOptions);
exports.GET = handler;
exports.POST = handler;
