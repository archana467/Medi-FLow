const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Update Constants
const constantsContent = `
export const APPOINTMENT_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW'
};
export const APPOINTMENT_STATUS_LIST = Object.values(APPOINTMENT_STATUS);

export const CONSULTATION_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};
export const CONSULTATION_STATUS_LIST = Object.values(CONSULTATION_STATUS);

export const PRESCRIPTION_STATUS = {
  DRAFT: 'DRAFT',
  FINALIZED: 'FINALIZED'
};
export const PRESCRIPTION_STATUS_LIST = Object.values(PRESCRIPTION_STATUS);

export const INVOICE_STATUS = {
  DRAFT: 'DRAFT',
  ISSUED: 'ISSUED',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
  CANCELLED: 'CANCELLED'
};
export const INVOICE_STATUS_LIST = Object.values(INVOICE_STATUS);

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
  BANK_TRANSFER: 'BANK_TRANSFER',
  OTHER: 'OTHER'
};
export const PAYMENT_METHOD_LIST = Object.values(PAYMENT_METHOD);

export const PAYMENT_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};
export const PAYMENT_STATUS_LIST = Object.values(PAYMENT_STATUS);
`;

files[path.join(BACKEND_SRC, "utils", "constants.js")] = constantsContent;

// Models
files[path.join(BACKEND_SRC, "models", "consultation.model.js")] = `
import mongoose from 'mongoose';
import { CONSULTATION_STATUS_LIST, CONSULTATION_STATUS } from '../utils/constants.js';

const consultationSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    symptoms: [{ type: String, trim: true }],
    diagnosis: [{ type: String, trim: true }],
    clinicalNotes: { type: String, trim: true },
    vitals: {
      temperature: { type: Number },
      bloodPressure: { type: String, trim: true },
      heartRate: { type: Number },
      respiratoryRate: { type: Number },
      oxygenSaturation: { type: Number },
      weight: { type: Number },
      height: { type: Number }
    },
    followUpDate: { type: Date },
    followUpNotes: { type: String, trim: true },
    status: { type: String, enum: CONSULTATION_STATUS_LIST, default: CONSULTATION_STATUS.IN_PROGRESS }
  },
  { timestamps: true }
);

consultationSchema.index({ clinicId: 1, appointmentId: 1 });
consultationSchema.index({ clinicId: 1, patientId: 1 });
consultationSchema.index({ clinicId: 1, doctorId: 1 });

consultationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Consultation', consultationSchema);
`;

files[path.join(BACKEND_SRC, "models", "prescription.model.js")] = `
import mongoose from 'mongoose';
import { PRESCRIPTION_STATUS_LIST, PRESCRIPTION_STATUS } from '../utils/constants.js';

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true, trim: true },
  frequency: { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  route: { type: String, trim: true },
  timing: { type: String, trim: true },
  instructions: { type: String, trim: true }
}, { _id: false });

const prescriptionSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation', required: true, unique: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    medicines: [medicineSchema],
    generalInstructions: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: PRESCRIPTION_STATUS_LIST, default: PRESCRIPTION_STATUS.DRAFT },
    issuedAt: { type: Date }
  },
  { timestamps: true }
);

prescriptionSchema.index({ clinicId: 1, consultationId: 1 });
prescriptionSchema.index({ clinicId: 1, patientId: 1 });

prescriptionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Prescription', prescriptionSchema);
`;

files[path.join(BACKEND_SRC, "models", "invoice.model.js")] = `
import mongoose from 'mongoose';
import { INVOICE_STATUS_LIST, INVOICE_STATUS } from '../utils/constants.js';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 } // quantity * unitPrice
}, { _id: false });

const invoiceSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    invoiceNumber: { type: String, required: true }, // unique per clinic
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true, min: 0 }, // sum of item amounts
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 }, // subtotal - discount + tax
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, required: true, min: 0 }, // total - amountPaid
    status: { type: String, enum: INVOICE_STATUS_LIST, default: INVOICE_STATUS.DRAFT },
    issuedAt: { type: Date },
    dueDate: { type: Date },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

invoiceSchema.index({ clinicId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ clinicId: 1, patientId: 1 });
invoiceSchema.index({ clinicId: 1, status: 1 });

invoiceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Invoice', invoiceSchema);
`;

files[path.join(BACKEND_SRC, "models", "payment.model.js")] = `
import mongoose from 'mongoose';
import { PAYMENT_METHOD_LIST, PAYMENT_STATUS_LIST, PAYMENT_STATUS } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: PAYMENT_METHOD_LIST, required: true },
    reference: { type: String, trim: true },
    status: { type: String, enum: PAYMENT_STATUS_LIST, default: PAYMENT_STATUS.SUCCESS },
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

paymentSchema.index({ clinicId: 1, invoiceId: 1 });
paymentSchema.index({ clinicId: 1, patientId: 1 });

paymentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Payment', paymentSchema);
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});
console.log("Phase 4 Constants & Models generated");
