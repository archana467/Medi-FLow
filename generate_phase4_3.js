const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Controllers
files[path.join(BACKEND_SRC, "controllers", "consultation.controller.js")] = `
import * as consultationService from '../services/consultation.service.js';
import * as appointmentService from '../services/appointment.service.js';
import { validateConsultation } from '../validators/consultation.validator.js';
import { getTenantFilter } from '../middleware/tenant.middleware.js';

export const createConsultation = async (req, res, next) => {
  try {
    const { isValid, errors } = validateConsultation(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const clinicId = req.user.clinicId;
    const { appointmentId } = req.body;

    const appointment = await appointmentService.getAppointmentById(appointmentId, clinicId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.status === 'CANCELLED') return res.status(400).json({ success: false, message: 'Cannot create consultation for cancelled appointment' });

    // Restrict DOCTOR to their own appointments
    if (req.user.role === 'DOCTOR' && appointment.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this appointment' });
    }

    // Check if consultation exists
    const existing = await consultationService.getConsultations({ clinicId, appointmentId }, 0, 1);
    if (existing.data.length > 0) return res.status(409).json({ success: false, message: 'Consultation already exists' });

    const consultationData = {
      ...req.body,
      clinicId,
      patientId: appointment.patientId._id,
      doctorId: appointment.doctorId._id
    };

    const consultation = await consultationService.createConsultation(consultationData);
    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id, req.user.clinicId);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    // Patient restriction
    if (req.user.role === 'PATIENT' && consultation.patientId._id.toString() !== req.user.patientId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};

export const getConsultations = async (req, res, next) => {
  try {
    const filter = getTenantFilter(req);
    
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;
    if (req.query.status) filter.status = req.query.status;

    // RBAC restrictions
    if (req.user.role === 'PATIENT') filter.patientId = req.user.patientId;
    if (req.user.role === 'DOCTOR') filter.doctorId = req.user.doctorId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await consultationService.getConsultations(filter, skip, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateConsultation = async (req, res, next) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id, req.user.clinicId);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    if (req.user.role === 'DOCTOR' && consultation.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (consultation.status === 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Cannot edit completed consultation' });
    }

    // Do not allow overriding protected fields
    delete req.body.clinicId;
    delete req.body.patientId;
    delete req.body.doctorId;
    delete req.body.appointmentId;

    const updated = await consultationService.updateConsultation(req.params.id, req.user.clinicId, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const completeConsultation = async (req, res, next) => {
  try {
    const consultation = await consultationService.getConsultationById(req.params.id, req.user.clinicId);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    if (req.user.role === 'DOCTOR' && consultation.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await consultationService.updateConsultation(req.params.id, req.user.clinicId, { status: 'COMPLETED' });
    
    // Optionally update appointment status here if logic dictates
    // await appointmentService.updateAppointment(consultation.appointmentId._id, req.user.clinicId, { status: 'COMPLETED' });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
`;

files[path.join(BACKEND_SRC, "controllers", "prescription.controller.js")] = `
import * as prescriptionService from '../services/prescription.service.js';
import * as consultationService from '../services/consultation.service.js';
import { validatePrescription } from '../validators/prescription.validator.js';
import { getTenantFilter } from '../middleware/tenant.middleware.js';

export const createPrescription = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePrescription(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const clinicId = req.user.clinicId;
    const { consultationId } = req.body;

    const consultation = await consultationService.getConsultationById(consultationId, clinicId);
    if (!consultation) return res.status(404).json({ success: false, message: 'Consultation not found' });

    // Doctor restriction
    if (req.user.role === 'DOCTOR' && consultation.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized for this consultation' });
    }

    const existing = await prescriptionService.getPrescriptions({ clinicId, consultationId }, 0, 1);
    if (existing.data.length > 0) return res.status(409).json({ success: false, message: 'Prescription already exists' });

    const prescriptionData = {
      ...req.body,
      clinicId,
      appointmentId: consultation.appointmentId._id,
      patientId: consultation.patientId._id,
      doctorId: consultation.doctorId._id
    };

    const prescription = await prescriptionService.createPrescription(prescriptionData);
    res.status(201).json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id, req.user.clinicId);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'PATIENT' && prescription.patientId._id.toString() !== req.user.patientId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: prescription });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptions = async (req, res, next) => {
  try {
    const filter = getTenantFilter(req);
    
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.consultationId) filter.consultationId = req.query.consultationId;

    if (req.user.role === 'PATIENT') filter.patientId = req.user.patientId;
    if (req.user.role === 'DOCTOR') filter.doctorId = req.user.doctorId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await prescriptionService.getPrescriptions(filter, skip, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id, req.user.clinicId);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'DOCTOR' && prescription.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (prescription.status === 'FINALIZED') {
      return res.status(400).json({ success: false, message: 'Cannot edit a finalized prescription' });
    }

    delete req.body.clinicId;
    delete req.body.patientId;
    delete req.body.doctorId;
    delete req.body.consultationId;
    delete req.body.appointmentId;

    const updated = await prescriptionService.updatePrescription(req.params.id, req.user.clinicId, req.body);
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const finalizePrescription = async (req, res, next) => {
  try {
    const prescription = await prescriptionService.getPrescriptionById(req.params.id, req.user.clinicId);
    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });

    if (req.user.role === 'DOCTOR' && prescription.doctorId._id.toString() !== req.user.doctorId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (prescription.status === 'FINALIZED') {
      return res.status(400).json({ success: false, message: 'Prescription is already finalized' });
    }

    const updated = await prescriptionService.updatePrescription(req.params.id, req.user.clinicId, { 
        status: 'FINALIZED',
        issuedAt: new Date()
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
`;

files[path.join(BACKEND_SRC, "controllers", "invoice.controller.js")] = `
import * as billingService from '../services/billing.service.js';
import * as appointmentService from '../services/appointment.service.js';
import { validateInvoice, validatePayment } from '../validators/billing.validator.js';
import { getTenantFilter } from '../middleware/tenant.middleware.js';
import mongoose from 'mongoose';

export const createInvoice = async (req, res, next) => {
  try {
    const { isValid, errors } = validateInvoice(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const clinicId = req.user.clinicId;
    
    const invoiceData = {
      ...req.body,
      clinicId,
      createdBy: req.user.userId
    };

    if (invoiceData.appointmentId) {
        const appointment = await appointmentService.getAppointmentById(invoiceData.appointmentId, clinicId);
        if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
        // Enforce doctor/patient match from appointment
        invoiceData.patientId = appointment.patientId._id;
        invoiceData.doctorId = appointment.doctorId._id;
    }

    const invoice = await billingService.createInvoice(invoiceData);
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await billingService.getInvoiceById(req.params.id, req.user.clinicId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

    if (req.user.role === 'PATIENT' && invoice.patientId._id.toString() !== req.user.patientId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const filter = getTenantFilter(req);
    
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.invoiceNumber) filter.invoiceNumber = { $regex: req.query.invoiceNumber, $options: 'i' };

    if (req.user.role === 'PATIENT') filter.patientId = req.user.patientId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await billingService.getInvoices(filter, skip, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const invoice = await billingService.getInvoiceById(req.params.id, req.user.clinicId);
        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        if (invoice.status === 'CANCELLED' || invoice.status === 'PAID') {
            return res.status(400).json({ success: false, message: \`Cannot change status from \${invoice.status}\` });
        }

        const updateData = { status };
        if (status === 'ISSUED' && !invoice.issuedAt) updateData.issuedAt = new Date();

        const updated = await billingService.updateInvoice(req.params.id, req.user.clinicId, updateData);
        res.json({ success: true, data: updated });
    } catch(err) {
        next(err);
    }
};

export const recordPayment = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { isValid, errors } = validatePayment(req.body);
        if (!isValid) throw { status: 400, message: errors };

        const clinicId = req.user.clinicId;
        const invoiceId = req.params.id;
        const amount = Number(req.body.amount);

        const invoice = await billingService.getInvoiceById(invoiceId, clinicId);
        if (!invoice) throw { status: 404, message: 'Invoice not found' };

        if (invoice.status === 'CANCELLED') throw { status: 400, message: 'Cannot record payment for cancelled invoice' };
        if (invoice.amountDue <= 0 || invoice.status === 'PAID') throw { status: 400, message: 'Invoice is already fully paid' };
        if (amount > invoice.amountDue) throw { status: 400, message: 'Payment exceeds amount due' };

        const paymentData = {
            ...req.body,
            clinicId,
            invoiceId,
            patientId: invoice.patientId._id,
            recordedBy: req.user.userId
        };

        const payment = await billingService.recordPayment(paymentData, session);

        const newAmountPaid = invoice.amountPaid + amount;
        const newAmountDue = invoice.total - newAmountPaid;
        let newStatus = invoice.status === 'DRAFT' ? 'PARTIALLY_PAID' : invoice.status;
        
        if (newAmountDue === 0) newStatus = 'PAID';
        else if (newAmountPaid > 0) newStatus = 'PARTIALLY_PAID';

        await billingService.updateInvoice(invoiceId, clinicId, {
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            status: newStatus
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ success: true, data: payment });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        if (error.status) return res.status(error.status).json({ success: false, message: error.message });
        next(error);
    }
};

export const getPayments = async (req, res, next) => {
    try {
        const payments = await billingService.getPaymentsByInvoice(req.params.id, req.user.clinicId);
        // Tenant checks are implicitly done via getPaymentsByInvoice clinicId
        res.json({ success: true, data: payments });
    } catch(err) {
        next(err);
    }
};
`;

// Routes
files[path.join(BACKEND_SRC, "routes", "consultation.routes.js")] = `
import express from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as consultationController from '../controllers/consultation.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.createConsultation);
router.get('/', consultationController.getConsultations);
router.get('/:id', consultationController.getConsultationById);
router.patch('/:id', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.updateConsultation);
router.post('/:id/complete', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), consultationController.completeConsultation);

export default router;
`;

files[path.join(BACKEND_SRC, "routes", "prescription.routes.js")] = `
import express from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as prescriptionController from '../controllers/prescription.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.createPrescription);
router.get('/', prescriptionController.getPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);
router.patch('/:id', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.updatePrescription);
router.post('/:id/finalize', requireRoles('DOCTOR', 'CLINIC_ADMIN', 'SUPER_ADMIN'), prescriptionController.finalizePrescription);

export default router;
`;

files[path.join(BACKEND_SRC, "routes", "invoice.routes.js")] = `
import express from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as invoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', requireRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

// Issue / Cancel / generic status updates
router.patch('/:id/status', requireRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.updateInvoiceStatus);

// Payments
router.post('/:id/payments', requireRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.recordPayment);
router.get('/:id/payments', invoiceController.getPayments);

export default router;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 4 Controllers and Routes generated");
