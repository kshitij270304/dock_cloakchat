import { getRedisClient } from "./redis";

interface RateLimitOptions {
    identifier: string;
    prefix: string;
    limit: number;
    window: number; // seconds
}

export async function rateLimit({
    identifier,
    prefix,
    limit,
    window,
}: RateLimitOptions) {

    const client = await getRedisClient();

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