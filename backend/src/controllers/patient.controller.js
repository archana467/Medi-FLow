import * as patientService from '../services/patient.service.js';
import { validatePatient, validatePatientStatus } from '../validators/patient.validator.js';

export const createPatient = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePatient(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const patient = await patientService.createPatient({ ...req.body, clinicId: req.user.clinicId });
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const filter = { clinicId: req.user.clinicId };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await patientService.getPatients(filter, (page - 1) * limit, parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patient = await patientService.getPatientById(req.params.id, req.user.clinicId);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatient = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePatient(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const patient = await patientService.updatePatient(req.params.id, req.user.clinicId, req.body);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const updatePatientStatus = async (req, res, next) => {
  try {
    const { isValid, errors } = validatePatientStatus(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const patient = await patientService.updatePatient(req.params.id, req.user.clinicId, { isActive: req.body.isActive });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};
