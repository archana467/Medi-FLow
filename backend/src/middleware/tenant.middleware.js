import { ROLES } from '../utils/roles.js';

export const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  // Super Admin can optionally specify a clinicId via query or body if they need to act on one,
  // but for tenant isolation, clinic-level users MUST be bound to their own clinicId.
  
  if (req.user.role === ROLES.SUPER_ADMIN) {
    // Super admins can operate across tenants or on a specific tenant.
    // If they provided a clinicId, use it; otherwise, they operate globally.
    req.tenant = {
      clinicId: req.query.clinicId || req.body.clinicId || null
    };
  } else {
    // Clinic level users MUST have a clinicId
    if (!req.user.clinicId) {
      return res.status(403).json({ success: false, message: 'Forbidden: User does not belong to a clinic' });
    }
    req.tenant = {
      clinicId: req.user.clinicId
    };
  }

  next();
};

export const getTenantFilter = (req) => {
  if (!req.user) return null;
  
  // If Super Admin, they can query all (no filter) unless they specified a tenant
  if (req.user.role === ROLES.SUPER_ADMIN) {
    return req.tenant?.clinicId ? { clinicId: req.tenant.clinicId } : {};
  }
  
  // Normal clinic users can only query their own clinic
  return { clinicId: req.user.clinicId };
};
