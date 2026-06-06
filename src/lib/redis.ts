import { createClient } from 'redis';

let redisClient: any = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
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

    redisClient.on('error', (err: any) => {
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
  } catch (error) {
    console.error('[Redis] Failed to initialize client:', error);
    throw error;
  }
}

export async function setOTPInRedis(
  userId: string,
  otp: string,
  expiryInSeconds: number = 600 // Default 10 minutes
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = `otp:${userId}`;

    await client.setEx(key, expiryInSeconds, otp);
    console.log(`[Redis] OTP cached for user ${userId}, expires in ${expiryInSeconds}s`);

    return true;
  } catch (error) {
    console.error('[Redis] Error caching OTP:', error);
    throw error;
  }
}

export async function getOTPFromRedis(userId: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    const key = `otp:${userId}`;

    const otp = await client.get(key);
    console.log(`[Redis] Retrieved OTP for user ${userId}:`, otp ? 'Found' : 'Not found');

    return otp;
  } catch (error) {
    console.error('[Redis] Error retrieving OTP:', error);
    throw error;
  }
}

export async function deleteOTPFromRedis(userId: string): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const key = `otp:${userId}`;

    await client.del(key);
    console.log(`[Redis] OTP deleted for user ${userId}`);

    return true;
  } catch (error) {
    console.error('[Redis] Error deleting OTP:', error);
    throw error;
  }
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('[Redis] Connection closed');
  }
}
