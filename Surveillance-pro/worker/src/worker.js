import { Worker } from 'bullmq';
import { redisConnectionOptions } from './config/redis.js';
import { Monitor } from './models/monitor.model.js';
import { Heartbeat } from './models/heartbeat.model.js';
import { checkHttp } from './checkers/http.checker.js';
import { checkSslCertificate } from './checkers/ssl.checker.js';
import { dispatchAlertsIfNeeded } from './services/alert.service.js';

export const QUEUE_NAME = 'monitor-checks';

export const createMonitorWorker = () => {
  const concurrency = Number(process.env.WORKER_CONCURRENCY) || 10;

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { monitorId, url, timeout } = job.data;
      console.log(`⏱️ [Worker] Processing check for job ${job.id} | Target: ${url}`);

      // 1. Fetch monitor from DB to inspect previous state
      let monitor = null;
      try {
        monitor = await Monitor.findById(monitorId);
      } catch (err) {
        // Can happen if monitorId is a dummy string during testing
      }

      const previousStatus = monitor ? monitor.status : 'PENDING';
      const monitorName = monitor ? monitor.name : (url || 'Test Target');

      // 2. Perform HTTP Check
      const httpResult = await checkHttp(url, timeout || 10000);

      // 3. Perform SSL Certificate Check (if HTTPS)
      let sslResult = null;
      if (url.startsWith('https://')) {
        sslResult = await checkSslCertificate(url);
      }

      // 4. Save Heartbeat record to MongoDB (if valid ObjectId)
      if (monitor) {
        try {
          await Heartbeat.create({
            monitorId: monitor._id,
            status: httpResult.status,
            statusCode: httpResult.statusCode,
            responseTimeMs: httpResult.responseTimeMs,
            ssl: sslResult ? {
              valid: sslResult.valid,
              daysRemaining: sslResult.daysRemaining,
              issuer: sslResult.issuer
            } : null,
            errorMessage: httpResult.errorMessage
          });

          // 5. Update Monitor document
          monitor.status = httpResult.status;
          monitor.lastCheck = new Date();
          monitor.lastLatencyMs = httpResult.responseTimeMs;
          monitor.lastStatusCode = httpResult.statusCode;
          if (sslResult && sslResult.valid !== null) {
            monitor.ssl = {
              valid: sslResult.valid,
              daysRemaining: sslResult.daysRemaining,
              issuer: sslResult.issuer,
              validTo: sslResult.validTo,
              lastChecked: new Date()
            };
          }
          await monitor.save();

          // 6. Dispatch Alerts if status changed (UP -> DOWN or DOWN -> UP)
          await dispatchAlertsIfNeeded(monitor, previousStatus, httpResult);
        } catch (dbErr) {
          console.error(`❌ [Worker DB Error] Failed to persist check for monitor ${monitorId}:`, dbErr.message);
        }
      }

      const sslSummary = sslResult && sslResult.daysRemaining !== null 
        ? `| SSL: ${sslResult.daysRemaining}j restants` 
        : '';

      console.log(
        `🏁 [Worker Result] Target: '${monitorName}' -> ${httpResult.status} ` +
        `(${httpResult.responseTimeMs}ms, Code: ${httpResult.statusCode || 'ERR'} ${sslSummary})`
      );

      return {
        monitorId,
        status: httpResult.status,
        latency: httpResult.responseTimeMs,
        statusCode: httpResult.statusCode
      };
    },
    {
      connection: redisConnectionOptions,
      concurrency
    }
  );

  worker.on('completed', (job) => {
    // Job cleanly finished
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [Worker Job Failed] Job ${job?.id}:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('❌ [Worker Error]:', err.message);
  });

  return worker;
};
