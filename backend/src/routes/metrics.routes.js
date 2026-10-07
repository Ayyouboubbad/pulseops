import { Router } from 'express';
import { getGlobalMetrics } from '../controllers/metrics.controller.js';

const router = Router();

router.get('/summary', getGlobalMetrics);

export default router;
