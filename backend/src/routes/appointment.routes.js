import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

router.use(authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]));

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

export default router;
