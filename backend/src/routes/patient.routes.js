import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as patientController from '../controllers/patient.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

// Only CLINIC_ADMIN, DOCTOR, RECEPTIONIST can manage patients
router.use(authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]));

router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.patch('/:id/status', authorizeRoles([ROLES.CLINIC_ADMIN]), patientController.updatePatientStatus);

export default router;
