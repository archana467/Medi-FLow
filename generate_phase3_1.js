const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// Constants
files[path.join(BACKEND_SRC, "utils", "constants.js")] = `
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};

export const APPOINTMENT_STATUS_LIST = Object.values(APPOINTMENT_STATUS);
`;

// Models
files[path.join(BACKEND_SRC, "models", "patient.model.js")] = `
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    patientId: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    emergencyContact: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
      relation: { type: String, trim: true }
    },
    bloodGroup: { type: String, trim: true },
    allergies: [{ type: String, trim: true }],
    medicalNotes: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

patientSchema.index({ clinicId: 1, patientId: 1 }, { unique: true });
patientSchema.index({ clinicId: 1, phone: 1 });
patientSchema.index({ clinicId: 1, firstName: 1, lastName: 1 });

patientSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Patient', patientSchema);
`;

files[path.join(BACKEND_SRC, "models", "doctor.model.js")] = `
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorCode: { type: String, required: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    experienceYears: { type: Number, min: 0, default: 0 },
    consultationDuration: { type: Number, default: 30 },
    consultationFee: { type: Number, default: 0 },
    bio: { type: String, trim: true },
    roomNumber: { type: String, trim: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

doctorSchema.index({ clinicId: 1, doctorCode: 1 }, { unique: true });
doctorSchema.index({ clinicId: 1, userId: 1 }, { unique: true });
doctorSchema.index({ clinicId: 1, specialization: 1 });

doctorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Doctor', doctorSchema);
`;

files[path.join(BACKEND_SRC, "models", "doctorAvailability.model.js")] = `
import mongoose from 'mongoose';

const doctorAvailabilitySchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDuration: { type: Number, required: true, default: 30 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

doctorAvailabilitySchema.index({ clinicId: 1, doctorId: 1, dayOfWeek: 1 });

doctorAvailabilitySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('DoctorAvailability', doctorAvailabilitySchema);
`;

files[path.join(BACKEND_SRC, "models", "appointment.model.js")] = `
import mongoose from 'mongoose';
import { APPOINTMENT_STATUS_LIST, APPOINTMENT_STATUS } from '../utils/constants.js';

const appointmentSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    appointmentDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: APPOINTMENT_STATUS_LIST, default: APPOINTMENT_STATUS.SCHEDULED },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String, trim: true }
  },
  { timestamps: true }
);

appointmentSchema.index({ clinicId: 1, doctorId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ clinicId: 1, patientId: 1, appointmentDate: 1 });

appointmentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Appointment', appointmentSchema);
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Generated models successfully.");
