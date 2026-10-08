const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// 1. Audit Constants
files[path.join(BACKEND_SRC, "utils", "auditConstants.js")] = `
export const AUDIT_ACTIONS = {
  AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  
  CLINIC_CREATED: 'CLINIC_CREATED',
  
  PATIENT_CREATED: 'PATIENT_CREATED',
  
  DOCTOR_CREATED: 'DOCTOR_CREATED',
  
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  
  CONSULTATION_CREATED: 'CONSULTATION_CREATED',
  CONSULTATION_UPDATED: 'CONSULTATION_UPDATED',
  
  PRESCRIPTION_CREATED: 'PRESCRIPTION_CREATED',
  PRESCRIPTION_FINALIZED: 'PRESCRIPTION_FINALIZED',
  
  INVOICE_CREATED: 'INVOICE_CREATED',
  INVOICE_ISSUED: 'INVOICE_ISSUED',
  PAYMENT_RECORDED: 'PAYMENT_RECORDED',
};
`;

// 2. Audit Model
files[path.join(BACKEND_SRC, "models", "auditLog.model.js")] = `
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }, // Nullable for platform actions
  actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String },
  action: { type: String, required: true },
  resourceType: { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' }
}, { timestamps: true });

auditLogSchema.index({ clinicId: 1, createdAt: -1 });
auditLogSchema.index({ actorUserId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

auditLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('AuditLog', auditLogSchema);
`;

// 3. Audit Service
files[path.join(BACKEND_SRC, "services", "audit.service.js")] = `
import AuditLog from '../models/auditLog.model.js';

export const logAudit = (data) => {
  // Fire and forget
  try {
    const audit = new AuditLog({
      clinicId: data.clinicId || null,
      actorUserId: data.actorUserId || null,
      actorRole: data.actorRole || null,
      action: data.action,
      resourceType: data.resourceType || null,
      resourceId: data.resourceId || null,
      description: data.description || '',
      metadata: data.metadata || {},
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      status: data.status || 'SUCCESS'
    });
    
    audit.save().catch(err => console.error('Audit Log Save Error:', err));
  } catch (err) {
    console.error('Audit Log Dispatch Error:', err);
  }
};
`;

// 4. Audit Controller & Routes
files[path.join(BACKEND_SRC, "controllers", "audit.controller.js")] = `
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
`;

files[path.join(BACKEND_SRC, "routes", "audit.routes.js")] = `
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { getAuditLogs } from '../controllers/audit.controller.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', getAuditLogs);

export default router;
`;


Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 6 Audit Setup Generated");
