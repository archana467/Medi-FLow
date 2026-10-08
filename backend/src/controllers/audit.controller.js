import AuditLog from '../models/auditLog.model.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    // Enforcement: non-SUPER_ADMIN must only see their clinic
    if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'CLINIC_ADMIN') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const query = {};
    if (req.user.role !== 'SUPER_ADMIN') {
        query.clinicId = req.user.clinicId;
    } else if (req.query.clinicId) {
        query.clinicId = req.query.clinicId;
    }
    
    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const logs = await AuditLog.find(query)
      .populate('actorUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};
