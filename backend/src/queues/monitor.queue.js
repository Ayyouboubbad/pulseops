import { Queue } from 'bullmq';
import { redisConnectionOptions } from '../config/redis.js';

export const QUEUE_NAME = 'monitor-checks';

export const monitorQueue = new Queue(QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: {
      count: 1000,
      age: 24 * 3600 // keep completed jobs for 24h
    },
    removeOnFail: {
      count: 5000
    }
  }
});

/**
 * Enqueue an immediate check for a target monitor
 * @param {Object} monitor - Monitor details { id, url, name, timeout, ... }
 */
export const addImmediateCheck = async (monitor) => {
  return await monitorQueue.add(
    `check-immediate-${monitor.id || monitor._id}`,
    {
      monitorId: (monitor.id || monitor._id).toString(),
      url: monitor.url,
      type: monitor.type || 'http',
      timeout: monitor.timeout || 10000,
      isImmediate: true
    },
    {
      jobId: `immediate-${monitor.id || monitor._id}-${Date.now()}`,
      priority: 1 // High priority for manual checks
    }
  );
};

/**
 * Register a repeatable check job in BullMQ
 * @param {Object} monitor
 */
export const scheduleRecurringCheck = async (monitor) => {
  const monitorId = (monitor.id || monitor._id).toString();
  const intervalMs = (monitor.interval || 60) * 1000;

  // Add repeatable job
  return await monitorQueue.add(
    `check-recurring-${monitorId}`,
    {
      monitorId,
      url: monitor.url,
      type: monitor.type || 'http',
      timeout: monitor.timeout || 10000,
      interval: monitor.interval || 60
    },
    {
      jobId: `recurring-${monitorId}`,
      repeat: {
        every: intervalMs
      }
    }
  );
};

/**
 * Remove repeatable checks for a monitor
 * @param {string} monitorId
 */
export const removeRecurringCheck = async (monitorId) => {
  const repeatableJobs = await monitorQueue.getRepeatableJobs();
  const targetJob = repeatableJobs.find(job => job.name === `check-recurring-${monitorId}` || job.id === `recurring-${monitorId}`);

  if (targetJob) {
    await monitorQueue.removeRepeatableByKey(targetJob.key);
    console.log(`[BullMQ] Removed recurring check schedule for monitor: ${monitorId}`);
    return true;
  }
  return false;
};

/**
 * Get queue metrics for observability and DevOps healthchecks
 */
export const getQueueMetrics = async () => {
  try {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      monitorQueue.getWaitingCount(),
      monitorQueue.getActiveCount(),
      monitorQueue.getCompletedCount(),
      monitorQueue.getFailedCount(),
      monitorQueue.getDelayedCount(),
      monitorQueue.isPaused()
    ]);

    return {
      queueName: QUEUE_NAME,
      status: paused ? 'paused' : 'running',
      counts: {
        waiting,
        active,
        completed,
        failed,
        delayed
      }
    };
  } catch (error) {
    return {
      queueName: QUEUE_NAME,
      status: 'error',
      error: error.message
    };
  }
};
