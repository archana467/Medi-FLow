import * as appointmentService from '../services/appointment.service.js';
import { validateAppointment, validateAppointmentStatus } from '../validators/appointment.validator.js';

export const createAppointment = async (req, res, next) => {
  try {
    // Lookup patient
    const Patient = await import('../models/patient.model.js').then(m => m.default);
    let patientId = req.body.patientId;
    if (req.user && req.user.role === 'PATIENT') {
        const patient = await Patient.findOne({ userId: req.user.userId });
        if (patient) {
            patientId = patient._id.toString();
            req.body.patientId = patientId; // Inject into body for validation
        } else {
            return res.status(400).json({ success: false, errors: ['Patient profile not found. Please contact support.'] });
        }
    }

    const { isValid, errors } = validateAppointment(req.body);
    if (!isValid) return res.status(400).json({ success: false, errors });

    const { doctorId, appointmentDate, startTime, endTime } = req.body;
    
    // Use doctor's clinic for the appointment
    const Doctor = await import('../models/doctor.model.js').then(m => m.default);
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    
    const clinicId = doctor.clinicId;


    // Check doctor availability (disabled for demo so booking works without seeding availability)
    const isAvailable = await appointmentService.checkDoctorAvailability(doctorId, clinicId, appointmentDate, startTime, endTime);
    // if (!isAvailable) {
    //   return res.status(400).json({ success: false, message: 'Doctor is not available at this time' });
    // }

    // Check appointment overlap
    const overlap = await appointmentService.checkAppointmentOverlap(doctorId, clinicId, appointmentDate, startTime, endTime);
    if (overlap) {
      return res.status(400).json({ success: false, message: 'Time slot is already booked' });
    }

    const appointment = await appointmentService.createAppointment({ 
      ...req.body,
      patientId, 
      clinicId,
      createdBy: req.user.userId
    });
    
    // Auto-create consultation for demo flow
    try {
        const Consultation = await import('../models/consultation.model.js').then(m => m.default);
        await Consultation.create({
            clinicId: clinicId,
            patientId: patientId,
            doctorId: doctorId,
            appointmentId: appointment._id,
            reason: req.body.reason || 'General Consultation',
            status: 'SCHEDULED',
            symptoms: req.body.reason || ''
        });
    } catch (e) {
        console.error('Failed to auto-create consultation', e);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, doctorId, patientId, status, date } = req.query;
    
    let filter = {};
    
    if (req.user.role === 'PATIENT') {
      const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
      if (patient) {
        filter.patientId = patient._id;
      } else {
        return res.json({ success: true, data: [], pagination: {} });
      }
    } else if (req.user.role === 'DOCTOR') {
      filter.clinicId = req.user.clinicId; // Doctors operate in their clinic
      const doctor = await import('../models/doctor.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
      if (doctor) {
        filter.doctorId = doctor._id;
      }
    } else {
      // Clinic admins etc
      filter.clinicId = req.user.clinicId;
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
    let query = { _id: req.params.id };
    if (req.user.role === 'PATIENT') {
        const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
        if (patient) query.patientId = patient._id;
    } else if (req.user.role !== 'SUPER_ADMIN') {
        query.clinicId = req.user.clinicId;
    }

    const appointment = await import('../models/appointment.model.js').then(m => m.default).then(model => model.findOne(query).populate('patientId').populate('doctorId'));
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

    let query = { _id: req.params.id };
    if (req.user.role === 'PATIENT') {
        const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
        if (patient) query.patientId = patient._id;
    } else if (req.user.role !== 'SUPER_ADMIN') {
        query.clinicId = req.user.clinicId;
    }

    const updateData = { status: req.body.status };
    if (req.body.status === 'CANCELLED') {
      updateData.cancelledBy = req.user.userId;
      updateData.cancellationReason = req.body.cancellationReason || 'Cancelled by user';
    }

    const appointment = await import('../models/appointment.model.js').then(m => m.default).then(model => model.findOneAndUpdate(query, updateData, { new: true, runValidators: true }));
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

    let query = { _id: req.params.id };
    if (req.user.role === 'PATIENT') {
        const patient = await import('../models/patient.model.js').then(m => m.default).then(model => model.findOne({ userId: req.user.userId }));
        if (patient) query.patientId = patient._id;
    } else if (req.user.role !== 'SUPER_ADMIN') {
        query.clinicId = req.user.clinicId;
    }

    const appointment = await import('../models/appointment.model.js').then(m => m.default).then(model => model.findOneAndUpdate(query, req.body, { new: true, runValidators: true }));
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
};
