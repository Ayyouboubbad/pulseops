import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.warn(`[Worker Redis] Retry attempt #${times}, waiting ${delay}ms...`);
    return delay;
  }
};

export const redisClient = new Redis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log('✅ [Worker Redis] Connected to broker');
});

redisClient.on('error', (err) => {
  console.error('❌ [Worker Redis] Connection error:', err.message);
});
