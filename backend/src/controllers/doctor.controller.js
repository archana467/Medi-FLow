import * as doctorService from '../services/doctor.service.js';
import { validateDoctor, validateDoctorAvailability } from '../validators/doctor.validator.js';

export const createDoctor = async (req, res, next) => {
  try {
    const { isValid, errors } = validateDoctor(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const existingDoctor = await doctorService.getDoctorByUserId(req.body.userId, req.user.clinicId);
    if (existingDoctor) return res.status(400).json({ success: false, message: 'User is already a doctor in this clinic' });

    const doctor = await doctorService.createDoctor({ ...req.body, clinicId: req.user.clinicId });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, specialization, isActive } = req.query;
    const filter = { clinicId: req.user.clinicId };
    
    if (search) filter.doctorCode = { $regex: search, $options: 'i' };
    if (specialization) filter.specialization = { $regex: specialization, $options: 'i' };
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const result = await doctorService.getDoctors(filter, (page - 1) * limit, parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id, req.user.clinicId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    const { isValid, errors } = validateDoctor(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const doctor = await doctorService.updateDoctor(req.params.id, req.user.clinicId, req.body);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// Availability
export const addAvailability = async (req, res, next) => {
  try {
    const { isValid, errors } = validateDoctorAvailability(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const overlap = await doctorService.checkAvailabilityOverlap(
      req.params.doctorId, 
      req.user.clinicId, 
      req.body.dayOfWeek, 
      req.body.startTime, 
      req.body.endTime
    );
    
    if (overlap) return res.status(400).json({ success: false, message: 'Availability slot overlaps with existing slot' });

    const availability = await doctorService.createAvailability({ 
      ...req.body, 
      doctorId: req.params.doctorId, 
      clinicId: req.user.clinicId 
    });
    res.status(201).json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const availability = await doctorService.getAvailability(req.params.doctorId, req.user.clinicId);
    res.json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

export const removeAvailability = async (req, res, next) => {
  try {
    const availability = await doctorService.deleteAvailability(req.params.availabilityId, req.user.clinicId);
    if (!availability) return res.status(404).json({ success: false, message: 'Availability not found' });
    res.json({ success: true, message: 'Availability removed' });
  } catch (error) {
    next(error);
  }
};
