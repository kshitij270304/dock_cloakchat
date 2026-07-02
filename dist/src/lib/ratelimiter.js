"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimit = rateLimit;
const redis_1 = require("./redis");
async function rateLimit({ identifier, prefix, limit, window, }) {
    const client = await (0, redis_1.getRedisClient)();
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - window * 1000;
    // Remove requests older than the window
    await client.zRemRangeByScore(key, 0, windowStart);
    // Count requests still inside the window
    const count = await client.zCard(key);
    if (count >= limit) {
        throw new Error("Too Many Requests");
    }
    // Store current request
    await client.zAdd(key, {
        score: now,
        value: `${now}-${Math.random()}`
    });
    // Automatically remove key after inactivity
    await client.expire(key, window);
}
