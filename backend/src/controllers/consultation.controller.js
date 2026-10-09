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
    let clinicId = req.user.clinicId;
    if (req.user.role === 'PATIENT' || req.user.role === 'SUPER_ADMIN') {
        clinicId = undefined; // Don't restrict by clinic for these roles
    }
    const consultation = await consultationService.getConsultationById(req.params.id, clinicId);
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
    let filter = {};
    if (req.user.role !== 'SUPER_ADMIN') {
        if (req.user.role === 'PATIENT') {
            const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.id || req.user.userId }));
            if (patient) filter.patientId = patient._id;
            else return res.json({ success: true, data: [], pagination: {} });
        } else if (req.user.role === 'DOCTOR') {
            const doctor = await import('../models/doctor.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.id || req.user.userId }));
            if (doctor) filter.doctorId = doctor._id;
            filter.clinicId = req.user.clinicId;
        } else {
            filter.clinicId = req.user.clinicId;
        }
    }
    
    if (req.query.patientId) filter.patientId = req.query.patientId;
    if (req.query.doctorId) filter.doctorId = req.query.doctorId;
    if (req.query.appointmentId) filter.appointmentId = req.query.appointmentId;
    if (req.query.status) filter.status = req.query.status;

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
