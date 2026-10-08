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
