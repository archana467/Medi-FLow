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
    
    if (req.user.role === 'PATIENT') {
      const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
      if (patient) {
        filter.patientId = patient._id;
      } else {
        return res.json({ success: true, data: [], pagination: {} });
      }
    } else if (req.user.role === 'DOCTOR') {
      const doctor = await import('../models/doctor.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    }

    
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
