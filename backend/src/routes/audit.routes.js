import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getAuditLogs } from '../controllers/audit.controller.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', getAuditLogs);

export default router;
