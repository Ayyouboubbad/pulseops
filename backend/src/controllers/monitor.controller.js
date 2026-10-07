import { Monitor } from '../models/monitor.model.js';
import { Heartbeat } from '../models/heartbeat.model.js';
import { createMonitorSchema, updateMonitorSchema } from '../validators/monitor.validator.js';
import { scheduleRecurringCheck, removeRecurringCheck, addImmediateCheck } from '../queues/monitor.queue.js';

/**
 * Créer un nouveau moniteur et planifier son exécution dans BullMQ
 */
export const createMonitor = async (req, res, next) => {
  try {
    const validatedData = createMonitorSchema.parse(req.body);

    const monitor = await Monitor.create(validatedData);

    // 1. Planifier la tâche récurrente dans BullMQ
    await scheduleRecurringCheck(monitor);

    // 2. Déclencher un check immédiat pour avoir un premier état sans attendre le premier intervalle
    await addImmediateCheck(monitor);

    res.status(201).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les moniteurs avec calcul du taux de disponibilité (uptime)
 */
export const getAllMonitors = async (req, res, next) => {
  try {
    const monitors = await Monitor.find().sort({ createdAt: -1 }).lean();

    // Calcul de l'uptime sur les dernières 24h pour chaque moniteur
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const enrichedMonitors = await Promise.all(
      monitors.map(async (m) => {
        const totalChecks = await Heartbeat.countDocuments({
          monitorId: m._id,
          createdAt: { $gte: oneDayAgo }
        });

        const upChecks = await Heartbeat.countDocuments({
          monitorId: m._id,
          status: 'UP',
          createdAt: { $gte: oneDayAgo }
        });

        const uptime24h = totalChecks === 0 ? 100 : Number(((upChecks / totalChecks) * 100).toFixed(2));

        return {
          ...m,
          uptime24h,
          totalChecks24h: totalChecks
        };
      })
    );

    res.json({
      success: true,
      count: enrichedMonitors.length,
      data: enrichedMonitors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer un moniteur par ID avec l'historique récent des pings (pour les graphiques Recharts)
 */
export const getMonitorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findById(id);

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    // Récupérer les 60 derniers heartbeats triés par ordre chronologique
    const heartbeats = await Heartbeat.find({ monitorId: id })
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    res.json({
      success: true,
      data: {
        monitor,
        heartbeats: heartbeats.reverse()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un moniteur
 */
export const updateMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = updateMonitorSchema.parse(req.body);

    const monitor = await Monitor.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    // Si le moniteur est actif, mettre à jour sa planification dans BullMQ
    if (monitor.isActive && monitor.status !== 'PAUSED') {
      await removeRecurringCheck(monitor._id);
      await scheduleRecurringCheck(monitor);
    }

    res.json({
      success: true,
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un moniteur, ses jobs BullMQ et ses métriques historiques
 */
export const deleteMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findByIdAndDelete(id);

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    // Retirer la planification BullMQ
    await removeRecurringCheck(id);

    // Supprimer les heartbeats associés
    await Heartbeat.deleteMany({ monitorId: id });

    res.json({
      success: true,
      message: 'Moniteur et historique supprimés avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre en pause la surveillance d'un moniteur
 */
export const pauseMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findById(id);

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    await removeRecurringCheck(id);
    monitor.status = 'PAUSED';
    monitor.isActive = false;
    await monitor.save();

    res.json({
      success: true,
      message: 'Surveillance mise en pause',
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reprendre la surveillance d'un moniteur
 */
export const resumeMonitor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findById(id);

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    monitor.status = 'PENDING';
    monitor.isActive = true;
    await monitor.save();

    await scheduleRecurringCheck(monitor);
    await addImmediateCheck(monitor);

    res.json({
      success: true,
      message: 'Surveillance reprise avec succès',
      data: monitor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Déclencher un check manuel immédiat (bouton "Check Now" sur le Dashboard)
 */
export const triggerCheckNow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const monitor = await Monitor.findById(id);

    if (!monitor) {
      return res.status(404).json({ success: false, error: 'Moniteur introuvable' });
    }

    const job = await addImmediateCheck(monitor);

    res.json({
      success: true,
      message: 'Check manuel envoyé dans la file d\'attente',
      jobId: job.id
    });
  } catch (error) {
    next(error);
  }
};
