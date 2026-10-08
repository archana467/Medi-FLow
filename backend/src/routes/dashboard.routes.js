import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getDashboardOverview } from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(requireAuth);
router.get('/overview', getDashboardOverview);

export default router;
