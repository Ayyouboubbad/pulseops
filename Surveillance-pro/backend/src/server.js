import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { redisClient } from './config/redis.js';
import { monitorQueue } from './queues/monitor.queue.js';
import { syncMonitorsOnStartup } from './schedulers/bootstrap.scheduler.js';
import mongoose from 'mongoose';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const server = http.createServer(app);

const startServer = async () => {
  // Connect to Database
  await connectDatabase();

  // Resynchroniser les moniteurs avec BullMQ
  await syncMonitorsOnStartup();

  server.listen(PORT, () => {
    console.log(`
=============================================================
  🚀 PulseOps Core API is running!
  📡 Port: http://localhost:${PORT}
  🏥 Healthcheck: http://localhost:${PORT}/api/health
  ⚙️  Environment: ${process.env.NODE_ENV || 'development'}
=============================================================
    `);
  });
};

// Graceful Shutdown Handler (DevOps Best Practice)
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 [${signal}] Signal received. Commencing graceful shutdown...`);

  // Stop accepting new HTTP requests
  server.close(() => {
    console.log('✅ [HTTP] Server closed');
  });

  try {
    // Close BullMQ Queue
    await monitorQueue.close();
    console.log('✅ [BullMQ] Monitor queue closed');

    // Close Redis Client
    await redisClient.quit();
    console.log('✅ [Redis] Connection cleanly terminated');

    // Close MongoDB Connection
    await mongoose.connection.close();
    console.log('✅ [MongoDB] Connection cleanly terminated');

    console.log('👋 [PulseOps] Process terminated cleanly. Bye!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
