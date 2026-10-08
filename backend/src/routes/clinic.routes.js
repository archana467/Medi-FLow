import express from 'express';
import { createClinic, getClinics, getClinicById, updateClinic, updateClinicStatus } from '../controllers/clinic.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Platform level routes (SUPER_ADMIN only)
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN), createClinic);
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN), getClinics);
router.patch('/:clinicId/status', authorizeRoles(ROLES.SUPER_ADMIN), updateClinicStatus);

// Clinic level routes (SUPER_ADMIN or CLINIC_ADMIN)
// Notice how requireTenant enforces tenant isolation conceptually
router.get('/:clinicId', requireTenant, getClinicById);
router.patch('/:clinicId', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN), requireTenant, updateClinic);

export default router;
