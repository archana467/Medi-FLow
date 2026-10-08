const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Validators
files[path.join(BACKEND_SRC, "validators", "patient.validator.js")] = `
export const validatePatient = (data) => {
  const errors = [];
  if (!data.firstName || data.firstName.trim().length < 2) errors.push('Valid first name is required');
  if (!data.lastName || data.lastName.trim().length < 2) errors.push('Valid last name is required');
  if (!data.dateOfBirth) errors.push('Date of birth is required');
  if (!['Male', 'Female', 'Other'].includes(data.gender)) errors.push('Valid gender is required');
  if (!data.phone || data.phone.trim().length < 5) errors.push('Valid phone number is required');
  
  if (data.email && !/^\\S+@\\S+\\.\\S+$/.test(data.email)) errors.push('Valid email is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePatientStatus = (data) => {
  const errors = [];
  if (typeof data.isActive !== 'boolean') errors.push('isActive must be a boolean');
  return {
    isValid: errors.length === 0,
    errors
  };
};
`;

files[path.join(BACKEND_SRC, "validators", "doctor.validator.js")] = `
export const validateDoctor = (data) => {
  const errors = [];
  if (!data.userId) errors.push('userId is required');
  if (!data.specialization || data.specialization.trim().length < 2) errors.push('Valid specialization is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDoctorAvailability = (data) => {
  const errors = [];
  if (data.dayOfWeek < 0 || data.dayOfWeek > 6) errors.push('dayOfWeek must be between 0 and 6');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) errors.push('Valid startTime is required (HH:mm)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.endTime)) errors.push('Valid endTime is required (HH:mm)');
  
  if (data.startTime >= data.endTime) errors.push('startTime must be before endTime');
  if (!data.slotDuration || data.slotDuration <= 0) errors.push('Valid slotDuration is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};
`;

files[path.join(BACKEND_SRC, "validators", "appointment.validator.js")] = `
import { APPOINTMENT_STATUS_LIST } from '../utils/constants.js';

export const validateAppointment = (data) => {
  const errors = [];
  if (!data.patientId) errors.push('patientId is required');
  if (!data.doctorId) errors.push('doctorId is required');
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(data.appointmentDate)) errors.push('Valid appointmentDate is required (YYYY-MM-DD)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) errors.push('Valid startTime is required (HH:mm)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.endTime)) errors.push('Valid endTime is required (HH:mm)');
  
  if (data.startTime >= data.endTime) errors.push('startTime must be before endTime');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAppointmentStatus = (data) => {
  const errors = [];
  if (!APPOINTMENT_STATUS_LIST.includes(data.status)) errors.push('Valid status is required');
  return {
    isValid: errors.length === 0,
    errors
  };
};
`;

// Services
files[path.join(BACKEND_SRC, "services", "patient.service.js")] = `
import Patient from '../models/patient.model.js';

export const generatePatientId = async (clinicId) => {
  const count = await Patient.countDocuments({ clinicId });
  return \`MED-\${clinicId.toString().substring(0, 4).toUpperCase()}-\${(count + 1).toString().padStart(6, '0')}\`;
};

export const createPatient = async (patientData) => {
  const patientId = await generatePatientId(patientData.clinicId);
  const patient = new Patient({ ...patientData, patientId });
  return await patient.save();
};

export const getPatients = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const patients = await Patient.find(filter).sort(sort).skip(skip).limit(limit);
  const total = await Patient.countDocuments(filter);
  return {
    data: patients,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getPatientById = async (id, clinicId) => {
  return await Patient.findOne({ _id: id, clinicId });
};

export const updatePatient = async (id, clinicId, updateData) => {
  return await Patient.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};
`;

files[path.join(BACKEND_SRC, "services", "doctor.service.js")] = `
import Doctor from '../models/doctor.model.js';
import DoctorAvailability from '../models/doctorAvailability.model.js';
import User from '../models/user.model.js';

export const generateDoctorCode = async (clinicId) => {
  const count = await Doctor.countDocuments({ clinicId });
  return \`DOC-\${clinicId.toString().substring(0, 4).toUpperCase()}-\${(count + 1).toString().padStart(4, '0')}\`;
};

export const createDoctor = async (doctorData) => {
  const doctorCode = await generateDoctorCode(doctorData.clinicId);
  const doctor = new Doctor({ ...doctorData, doctorCode });
  return await doctor.save();
};

export const getDoctors = async (filter, skip = 0, limit = 10) => {
  const doctors = await Doctor.find(filter).populate('userId', 'name email').skip(skip).limit(limit);
  const total = await Doctor.countDocuments(filter);
  return {
    data: doctors,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getDoctorById = async (id, clinicId) => {
  return await Doctor.findOne({ _id: id, clinicId }).populate('userId', 'name email');
};

export const getDoctorByUserId = async (userId, clinicId) => {
  return await Doctor.findOne({ userId, clinicId });
};

export const updateDoctor = async (id, clinicId, updateData) => {
  return await Doctor.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};

// Availability
export const createAvailability = async (availabilityData) => {
  const availability = new DoctorAvailability(availabilityData);
  return await availability.save();
};

export const getAvailability = async (doctorId, clinicId) => {
  return await DoctorAvailability.find({ doctorId, clinicId }).sort({ dayOfWeek: 1, startTime: 1 });
};

export const deleteAvailability = async (id, clinicId) => {
  return await DoctorAvailability.findOneAndDelete({ _id: id, clinicId });
};

export const checkAvailabilityOverlap = async (doctorId, clinicId, dayOfWeek, startTime, endTime) => {
  return await DoctorAvailability.findOne({
    doctorId,
    clinicId,
    dayOfWeek,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
};
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Generated validators and services successfully.");
