import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as doctorController from '../controllers/doctor.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

router.get('/', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getDoctors);
router.get('/:id', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getDoctorById);
router.get('/:doctorId/availability', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getAvailability);

// Only CLINIC_ADMIN can manage doctors and their availability
router.use(authorizeRoles([ROLES.CLINIC_ADMIN]));
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);
router.post('/:doctorId/availability', doctorController.addAvailability);
router.delete('/:doctorId/availability/:availabilityId', doctorController.removeAvailability);

export default router;
