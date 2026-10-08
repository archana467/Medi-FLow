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
            return res.status(400).json({ success: false, message: `Cannot change status from ${invoice.status}` });
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
