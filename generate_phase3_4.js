const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Controllers
files[path.join(BACKEND_SRC, "controllers", "patient.controller.js")] = `
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
`;

files[path.join(BACKEND_SRC, "controllers", "doctor.controller.js")] = `
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
`;

files[path.join(BACKEND_SRC, "controllers", "appointment.controller.js")] = `
import * as appointmentService from '../services/appointment.service.js';
import { validateAppointment, validateAppointmentStatus } from '../validators/appointment.validator.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { isValid, errors } = validateAppointment(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const { doctorId, appointmentDate, startTime, endTime } = req.body;
    const clinicId = req.user.clinicId;

    // Check doctor availability
    const isAvailable = await appointmentService.checkDoctorAvailability(doctorId, clinicId, appointmentDate, startTime, endTime);
    if (!isAvailable) {
      return res.status(400).json({ success: false, message: 'Doctor is not available at this time' });
    }

    // Check appointment overlap
    const overlap = await appointmentService.checkAppointmentOverlap(doctorId, clinicId, appointmentDate, startTime, endTime);
    if (overlap) {
      return res.status(400).json({ success: false, message: 'Time slot is already booked' });
    }

    const appointment = await appointmentService.createAppointment({ 
      ...req.body, 
      clinicId,
      createdBy: req.user.id
    });
    
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, doctorId, patientId, status, date } = req.query;
    const filter = { clinicId: req.user.clinicId };
    
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    if (date) filter.appointmentDate = date;

    const result = await appointmentService.getAppointments(filter, (page - 1) * limit, parseInt(limit));
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id, req.user.clinicId);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { isValid, errors } = validateAppointmentStatus(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const updateData = { status: req.body.status };
    if (req.body.status === 'CANCELLED') {
      updateData.cancelledBy = req.user.id;
      updateData.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    }

    const appointment = await appointmentService.updateAppointment(req.params.id, req.user.clinicId, updateData);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req, res, next) => {
  try {
    const { isValid, errors } = validateAppointment(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    // Assuming we might allow time changes, we need to check overlap again if time changed
    const appointment = await appointmentService.updateAppointment(req.params.id, req.user.clinicId, req.body);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
`;

// Routes
files[path.join(BACKEND_SRC, "routes", "patient.routes.js")] = `
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as patientController from '../controllers/patient.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

// Only CLINIC_ADMIN, DOCTOR, RECEPTIONIST can manage patients
router.use(authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]));

router.post('/', patientController.createPatient);
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.patch('/:id/status', authorizeRoles([ROLES.CLINIC_ADMIN]), patientController.updatePatientStatus);

export default router;
`;

files[path.join(BACKEND_SRC, "routes", "doctor.routes.js")] = `
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as doctorController from '../controllers/doctor.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

router.get('/', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getDoctors);
router.get('/:id', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getDoctorById);
router.get('/:doctorId/availability', authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]), doctorController.getAvailability);

// Only CLINIC_ADMIN can manage doctors and their availability
router.use(authorizeRoles([ROLES.CLINIC_ADMIN]));
router.post('/', doctorController.createDoctor);
router.put('/:id', doctorController.updateDoctor);
router.post('/:doctorId/availability', doctorController.addAvailability);
router.delete('/:doctorId/availability/:availabilityId', doctorController.removeAvailability);

export default router;
`;

files[path.join(BACKEND_SRC, "routes", "appointment.routes.js")] = `
import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { ROLES } from '../utils/roles.js';
import * as appointmentController from '../controllers/appointment.controller.js';

const router = express.Router();

// All routes require authentication and tenant access
router.use(requireAuth);
router.use(requireTenant);

router.use(authorizeRoles([ROLES.CLINIC_ADMIN, ROLES.RECEPTIONIST, ROLES.DOCTOR, ROLES.PATIENT]));

router.post('/', appointmentController.createAppointment);
router.get('/', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id', appointmentController.updateAppointment);
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

export default router;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Generated controllers and routes successfully.");
