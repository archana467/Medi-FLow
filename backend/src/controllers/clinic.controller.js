import * as clinicService from '../services/clinic.service.js';
import { validateClinic, validateClinicStatus } from '../validators/clinic.validator.js';
import { ROLES } from '../utils/roles.js';

export const createClinic = async (req, res, next) => {
  try {
    const { isValid, errors } = validateClinic(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const clinic = await clinicService.createClinic(req.body);
    res.status(201).json({ success: true, clinic });
  } catch (error) {
    next(error);
  }
};

export const getClinics = async (req, res, next) => {
  try {
    const clinics = await clinicService.getClinics();
    res.status(200).json({ success: true, clinics });
  } catch (error) {
    next(error);
  }
};

export const getClinicById = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    
    // Authorization Check: Tenant boundary
    if (req.user.role !== ROLES.SUPER_ADMIN && req.user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot access another clinic' });
    }

    const clinic = await clinicService.getClinicById(clinicId);
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    res.status(200).json({ success: true, clinic });
  } catch (error) {
    next(error);
  }
};

export const updateClinic = async (req, res, next) => {
  try {
    const { clinicId } = req.params;

    // Authorization Check: Tenant boundary
    if (req.user.role !== ROLES.SUPER_ADMIN && req.user.clinicId !== clinicId) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot update another clinic' });
    }

    const clinic = await clinicService.updateClinic(clinicId, req.body);
    res.status(200).json({ success: true, clinic });
  } catch (error) {
    next(error);
  }
};

export const updateClinicStatus = async (req, res, next) => {
  try {
    const { clinicId } = req.params;
    
    const { isValid, errors } = validateClinicStatus(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const clinic = await clinicService.updateClinicStatus(clinicId, req.body.isActive);
    res.status(200).json({ success: true, clinic });
  } catch (error) {
    next(error);
  }
};
