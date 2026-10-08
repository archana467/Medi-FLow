import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as consultationController from '../controllers/consultation.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.createConsultation);
router.get('/', consultationController.getConsultations);
router.get('/:id', consultationController.getConsultationById);
router.patch('/:id', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.updateConsultation);
router.post('/:id/complete', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.completeConsultation);

export default router;
