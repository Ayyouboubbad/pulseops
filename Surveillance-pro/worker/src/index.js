import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';
import { createMonitorWorker } from './worker.js';
import { redisClient } from './config/redis.js';
import mongoose from 'mongoose';

dotenv.config();

console.log(`
=============================================================
  ⚡ PulseOps Distributed Worker Engine is Starting...
  🧵 Concurrency: ${process.env.WORKER_CONCURRENCY || 10} threads
  🌐 Environment: ${process.env.NODE_ENV || 'development'}
=============================================================
`);

const startWorker = async () => {
  // 1. Connect to MongoDB
  await connectDatabase();

  // 2. Start BullMQ Worker
  const worker = createMonitorWorker();
  console.log('🚀 [Worker] Consuming jobs from BullMQ queue "monitor-checks"...\n');

  // Graceful Shutdown
  const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 [${signal}] Stopping worker safely...`);
    try {
      await worker.close();
      console.log('✅ [Worker] BullMQ worker paused and closed');

      await redisClient.quit();
      console.log('✅ [Worker Redis] Client disconnected');

      await mongoose.connection.close();
      console.log('✅ [Worker DB] MongoDB connection cleanly closed');

      console.log('👋 [Worker] Clean shutdown complete.');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startWorker();
