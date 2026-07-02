"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = getRedisClient;
exports.setOTPInRedis = setOTPInRedis;
exports.getOTPFromRedis = getOTPFromRedis;
exports.deleteOTPFromRedis = deleteOTPFromRedis;
exports.closeRedisConnection = closeRedisConnection;
const redis_1 = require("redis");
let redisClient = null;
async function getRedisClient() {
    if (redisClient) {
        return redisClient;
    }
    try {
        redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 10) {
                        console.error('[Redis] Max reconnection attempts reached');
                        return new Error('Max Redis reconnection attempts reached');
                    }
                    return retries * 100;
                },
            },
        });
        redisClient.on('error', (err) => {
            console.error('[Redis] Client error:', err);
        });
        redisClient.on('connect', () => {
            console.log('[Redis] Connected successfully');
        });
        redisClient.on('reconnecting', () => {
            console.log('[Redis] Reconnecting...');
        });
        await redisClient.connect();
        console.log('[Redis] Client initialized and connected');
        return redisClient;
    }
    catch (error) {
        console.error('[Redis] Failed to initialize client:', error);
        throw error;
    }
}
async function setOTPInRedis(userId, otp, expiryInSeconds = 600 // Default 10 minutes
) {
    try {
        const client = await getRedisClient();
        const key = `otp:${userId}`;
        await client.setEx(key, expiryInSeconds, otp);
        console.log(`[Redis] OTP cached for user ${userId}, expires in ${expiryInSeconds}s`);
        return true;
    }
    catch (error) {
        console.error('[Redis] Error caching OTP:', error);
        throw error;
    }
}
async function getOTPFromRedis(userId) {
    try {
        const client = await getRedisClient();
        const key = `otp:${userId}`;
        const otp = await client.get(key);
        console.log(`[Redis] Retrieved OTP for user ${userId}:`, otp ? 'Found' : 'Not found');
        return otp;
    }
    catch (error) {
        console.error('[Redis] Error retrieving OTP:', error);
        throw error;
    }
}
async function deleteOTPFromRedis(userId) {
    try {
        const client = await getRedisClient();
        const key = `otp:${userId}`;
        await client.del(key);
        console.log(`[Redis] OTP deleted for user ${userId}`);
        return true;
    }
    catch (error) {
        console.error('[Redis] Error deleting OTP:', error);
        throw error;
    }
}
async function closeRedisConnection() {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        console.log('[Redis] Connection closed');
    }
}
