import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as prescriptionController from '../controllers/prescription.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.createPrescription);
router.get('/', prescriptionController.getPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.patch('/:id', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.updatePrescription);
router.post('/:id/finalize', authorizeRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.finalizePrescription);

export default router;
