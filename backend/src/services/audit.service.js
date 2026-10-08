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
