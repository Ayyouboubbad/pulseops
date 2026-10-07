import { Router } from 'express';
import {
  createMonitor,
  getAllMonitors,
  getMonitorById,
  updateMonitor,
  deleteMonitor,
  pauseMonitor,
  resumeMonitor,
  triggerCheckNow
} from '../controllers/monitor.controller.js';

const router = Router();

router.route('/')
  .post(createMonitor)
  .get(getAllMonitors);

router.route('/:id')
  .get(getMonitorById)
  .put(updateMonitor)
  .delete(deleteMonitor);

router.post('/:id/pause', pauseMonitor);
router.post('/:id/resume', resumeMonitor);
router.post('/:id/check-now', triggerCheckNow);

export default router;
