import * as userService from '../services/user.service.js';
import { validateUser, validateRoleUpdate, validateStatusUpdate } from '../validators/user.validator.js';
import { ROLES } from '../utils/roles.js';
import { getTenantFilter } from '../middleware/tenant.middleware.js';

export const createUser = async (req, res, next) => {
  try {
    const { isValid, errors } = validateUser(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const { role } = req.body;
    
    // Authorization Check for SUPER_ADMIN creation
    if (role === ROLES.SUPER_ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ success: false, message: 'Forbidden: Only SUPER_ADMIN can create another SUPER_ADMIN' });
    }

    // Determine clinicId
    let clinicId = req.body.clinicId;

    if (req.user.role === ROLES.SUPER_ADMIN) {
      // Super admin can assign any valid clinicId or null (if they create another SUPER_ADMIN)
      if (role !== ROLES.SUPER_ADMIN && !clinicId) {
        return res.status(400).json({ success: false, message: 'Clinic ID is required for clinic-level users' });
      }
    } else {
      // Clinic Admin can only create users in their own clinic
      clinicId = req.user.clinicId;
      
      // Ensure Clinic Admin doesn't try to create a SUPER_ADMIN
      if (role === ROLES.SUPER_ADMIN) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot create SUPER_ADMIN' });
      }
    }

    const userData = { ...req.body, clinicId };
    const user = await userService.createUser(userData);
    
    const userObj = user.toJSON();
    delete userObj.passwordHash;
    
    res.status(201).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const filter = getTenantFilter(req) || {};
    const users = await userService.getUsers(filter);
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Tenant Check
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      if (user.clinicId?.toString() !== req.user.clinicId?.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: User belongs to another clinic' });
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const { isValid, errors } = validateRoleUpdate(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const targetUser = await userService.getUserById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Authorization checks
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      // Clinic admin trying to manage
      if (targetUser.clinicId?.toString() !== req.user.clinicId?.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: User belongs to another clinic' });
      }
      
      // Clinic admin cannot promote to SUPER_ADMIN
      if (role === ROLES.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot promote to SUPER_ADMIN' });
      }

      // Clinic admin cannot demote/modify another SUPER_ADMIN if one ended up in their clinic (edge case)
      if (targetUser.role === ROLES.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot modify SUPER_ADMIN' });
      }
      
      // Clinic admin cannot change their own role to something else to escape? (optional, but good practice)
      if (targetUser._id.toString() === req.user.userId && role !== ROLES.CLINIC_ADMIN) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot demote yourself' });
      }
    }

    const updatedUser = await userService.updateUserRole(userId, role);
    const userObj = updatedUser.toJSON();
    delete userObj.passwordHash;

    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const { isValid, errors } = validateStatusUpdate(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const targetUser = await userService.getUserById(userId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'User not found' });

    // Authorization checks
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      if (targetUser.clinicId?.toString() !== req.user.clinicId?.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: User belongs to another clinic' });
      }
      if (targetUser.role === ROLES.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot modify SUPER_ADMIN' });
      }
      if (targetUser._id.toString() === req.user.userId) {
         return res.status(403).json({ success: false, message: 'Forbidden: Cannot deactivate yourself' });
      }
    }

    const updatedUser = await userService.updateUserStatus(userId, isActive);
    const userObj = updatedUser.toJSON();
    delete userObj.passwordHash;

    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};
