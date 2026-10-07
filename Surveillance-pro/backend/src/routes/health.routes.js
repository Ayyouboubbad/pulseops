import { Router } from 'express';
import { checkRedisHealth } from '../config/redis.js';
import { checkDatabaseHealth } from '../config/database.js';
import { getQueueMetrics, addImmediateCheck } from '../queues/monitor.queue.js';

const router = Router();

/**
 * @route GET /api/health
 * @desc Overall healthcheck for DevOps (Redis, Mongo, BullMQ)
 */
router.get('/', async (req, res) => {
  const [redisHealth, dbHealth, queueMetrics] = await Promise.all([
    checkRedisHealth(),
    checkDatabaseHealth(),
    getQueueMetrics()
  ]);

  const isHealthy = redisHealth.status === 'healthy' && (dbHealth.status === 'healthy' || dbHealth.status === 'connecting');

  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'pulseops-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    components: {
      redis: redisHealth,
      database: dbHealth,
      queue: queueMetrics
    }
  });
});

/**
 * @route POST /api/health/test-queue
 * @desc Test enqueuing a dummy check job to verify Redis + BullMQ pipeline
 */
router.post('/test-queue', async (req, res) => {
  try {
    const testMonitor = {
      id: 'test-' + Date.now(),
      url: req.body.url || 'https://google.com',
      type: 'http',
      timeout: 5000
    };

    const job = await addImmediateCheck(testMonitor);

    res.status(201).json({
      success: true,
      message: 'Test job successfully enqueued in BullMQ',
      job: {
        id: job.id,
        name: job.name,
        data: job.data
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to enqueue test job',
      error: error.message
    });
  }
});

export default router;
