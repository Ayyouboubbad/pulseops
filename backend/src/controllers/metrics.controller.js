import { Monitor } from '../models/monitor.model.js';
import { Heartbeat } from '../models/heartbeat.model.js';

/**
 * Calculer les indicateurs globaux pour le tableau de bord (KPIs)
 */
export const getGlobalMetrics = async (req, res, next) => {
  try {
    const totalMonitors = await Monitor.countDocuments();
    const upMonitors = await Monitor.countDocuments({ status: 'UP' });
    const downMonitors = await Monitor.countDocuments({ status: 'DOWN' });
    const pausedMonitors = await Monitor.countDocuments({ status: 'PAUSED' });

    // Calcul de la latence moyenne actuelle des moniteurs UP
    const avgLatencyAggregate = await Monitor.aggregate([
      { $match: { status: 'UP', lastLatencyMs: { $gt: 0 } } },
      { $group: { _id: null, avgLatency: { $avg: '$lastLatencyMs' } } }
    ]);
    const avgLatencyMs = avgLatencyAggregate.length > 0 ? Math.round(avgLatencyAggregate[0].avgLatency) : 0;

    // Calcul du taux global d'uptime sur les 24 dernières heures
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const totalHeartbeats = await Heartbeat.countDocuments({ createdAt: { $gte: oneDayAgo } });
    const upHeartbeats = await Heartbeat.countDocuments({ status: 'UP', createdAt: { $gte: oneDayAgo } });
    const globalUptime24h = totalHeartbeats === 0 ? 100 : Number(((upHeartbeats / totalHeartbeats) * 100).toFixed(2));

    // Liste des incidents en cours (services DOWN)
    const activeIncidents = await Monitor.find({ status: 'DOWN' })
      .select('name url lastCheck lastLatencyMs lastStatusCode')
      .lean();

    res.json({
      success: true,
      data: {
        summary: {
          total: totalMonitors,
          up: upMonitors,
          down: downMonitors,
          paused: pausedMonitors,
          avgLatencyMs,
          globalUptime24h
        },
        activeIncidents
      }
    });
  } catch (error) {
    next(error);
  }
};
