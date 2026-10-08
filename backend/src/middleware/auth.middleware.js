import { verifyAccessToken } from '../utils/token.js';
import User from '../models/user.model.js';
import Clinic from '../models/clinic.model.js';
import { ROLES } from '../utils/roles.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }

    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    // If user is clinic-level, verify their clinic is active
    if (user.role !== ROLES.SUPER_ADMIN && user.clinicId) {
      const clinic = await Clinic.findById(user.clinicId);
      if (!clinic || !clinic.isActive) {
        return res.status(403).json({ success: false, message: 'Clinic is inactive or not found' });
      }
    }

    // Attach user context to request
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      clinicId: user.clinicId ? user.clinicId.toString() : null
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
