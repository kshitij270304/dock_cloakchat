"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const redis_1 = require("@/lib/redis");
async function GET() {
    try {
        console.log("================================");
        console.log("[REDIS TEST] STARTING");
        console.log("================================");
        const client = await (0, redis_1.getRedisClient)();
        // Write test value
        await client.set("chatgpt-test", "working");
        // Read it back
        const value = await client.get("chatgpt-test");
        // Check key exists
        const exists = await client.exists("chatgpt-test");
        console.log("[REDIS TEST] Stored Value:", value);
        console.log("[REDIS TEST] Key Exists:", exists);
        return server_1.NextResponse.json({
            success: true,
            message: "Redis connection successful",
            value,
            exists: exists === 1,
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error("================================");
        console.error("[REDIS TEST] FAILED");
        console.error(error);
        console.error("================================");
        return server_1.NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
        }, { status: 500 });
    }
}
