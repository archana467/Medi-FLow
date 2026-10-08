import express from 'express';
import { createUser, getUsers, getUserById, updateUserRole, updateUserStatus } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Only Admins can manage users
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.CLINIC_ADMIN));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:userId', getUserById);
router.patch('/:userId/role', updateUserRole);
router.patch('/:userId/status', updateUserStatus);

export default router;
