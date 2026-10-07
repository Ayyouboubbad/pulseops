import { Monitor } from '../models/monitor.model.js';
import { scheduleRecurringCheck, monitorQueue } from '../queues/monitor.queue.js';

/**
 * DevOps Resilience Pattern:
 * Resynchroniser les moniteurs MongoDB avec la file de répétition BullMQ au démarrage.
 */
export const syncMonitorsOnStartup = async () => {
  try {
    const activeMonitors = await Monitor.find({
      isActive: true,
      status: { $ne: 'PAUSED' }
    });

    console.log(`🔄 [Scheduler] Vérification de la synchronisation de ${activeMonitors.length} moniteur(s) actif(s)...`);

    for (const monitor of activeMonitors) {
      await scheduleRecurringCheck(monitor);
    }

    const repeatableJobs = await monitorQueue.getRepeatableJobs();
    console.log(`✅ [Scheduler] Synchronisation terminée : ${repeatableJobs.length} tâche(s) planifiée(s) dans BullMQ.`);
  } catch (error) {
    console.error('❌ [Scheduler Error] Échec de synchronisation des moniteurs:', error.message);
  }
};
