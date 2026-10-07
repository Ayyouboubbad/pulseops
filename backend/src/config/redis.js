import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const redisConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    console.warn(`[Redis] Connection retry attempt #${times}, waiting ${delay}ms...`);
    return delay;
  }
};

export const redisClient = new Redis(redisConnectionOptions);

redisClient.on('connect', () => {
  console.log('✅ [Redis] Connection initiated');
});

redisClient.on('ready', () => {
  console.log('🚀 [Redis] Client ready and connected successfully');
});

redisClient.on('error', (err) => {
  console.error('❌ [Redis] Connection error:', err.message);
});

redisClient.on('close', () => {
  console.warn('⚠️ [Redis] Connection closed');
});

export const checkRedisHealth = async () => {
  try {
    const start = Date.now();
    const pingResponse = await redisClient.ping();
    const latency = Date.now() - start;
    return {
      status: pingResponse === 'PONG' ? 'healthy' : 'degraded',
      latencyMs: latency,
      message: pingResponse
    };
  } catch (error) {
    return {
      status: 'down',
      error: error.message
    };
  }
};
