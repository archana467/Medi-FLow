const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Validators
files[path.join(BACKEND_SRC, "validators", "consultation.validator.js")] = `
import { CONSULTATION_STATUS_LIST } from '../utils/constants.js';

export const validateConsultation = (data) => {
  const errors = [];
  if (!data.appointmentId) errors.push('appointmentId is required');
  return { isValid: errors.length === 0, errors };
};

export const validateConsultationStatus = (data) => {
  const errors = [];
  if (!CONSULTATION_STATUS_LIST.includes(data.status)) errors.push('Valid status is required');
  return { isValid: errors.length === 0, errors };
};
`;

files[path.join(BACKEND_SRC, "validators", "prescription.validator.js")] = `
import { PRESCRIPTION_STATUS_LIST } from '../utils/constants.js';

export const validatePrescription = (data) => {
  const errors = [];
  if (!data.consultationId) errors.push('consultationId is required');
  if (data.medicines && !Array.isArray(data.medicines)) errors.push('medicines must be an array');
  
  if (data.medicines) {
    data.medicines.forEach((m, index) => {
      if (!m.name || !m.dosage || !m.frequency || !m.duration) {
        errors.push(\`Medicine at index \${index} is missing required fields (name, dosage, frequency, duration)\`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
};
`;

files[path.join(BACKEND_SRC, "validators", "billing.validator.js")] = `
import { INVOICE_STATUS_LIST, PAYMENT_METHOD_LIST } from '../utils/constants.js';

export const validateInvoice = (data) => {
  const errors = [];
  if (!data.patientId) errors.push('patientId is required');
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one invoice item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.quantity === undefined || item.unitPrice === undefined) {
        errors.push(\`Item at index \${index} is missing required fields\`);
      } else if (item.quantity < 1) {
        errors.push(\`Item at index \${index} must have quantity >= 1\`);
      } else if (item.unitPrice < 0) {
        errors.push(\`Item at index \${index} must have unitPrice >= 0\`);
      }
    });
  }
  if (data.discount < 0) errors.push('discount cannot be negative');
  if (data.tax < 0) errors.push('tax cannot be negative');
  
  return { isValid: errors.length === 0, errors };
};

export const validatePayment = (data) => {
  const errors = [];
  if (!data.amount || data.amount <= 0) errors.push('amount must be greater than 0');
  if (!PAYMENT_METHOD_LIST.includes(data.method)) errors.push('Valid payment method is required');
  return { isValid: errors.length === 0, errors };
};
`;

// Services
files[path.join(BACKEND_SRC, "services", "consultation.service.js")] = `
import Consultation from '../models/consultation.model.js';
import Appointment from '../models/appointment.model.js';

export const createConsultation = async (consultationData) => {
  const consultation = new Consultation(consultationData);
  return await consultation.save();
};

export const getConsultationById = async (id, clinicId) => {
  return await Consultation.findOne({ _id: id, clinicId })
    .populate('appointmentId')
    .populate('patientId', 'firstName lastName')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
};

export const getConsultations = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const consultations = await Consultation.find(filter)
    .populate('patientId', 'firstName lastName')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Consultation.countDocuments(filter);
  return {
    data: consultations,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateConsultation = async (id, clinicId, updateData) => {
  return await Consultation.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};
`;

files[path.join(BACKEND_SRC, "services", "prescription.service.js")] = `
import Prescription from '../models/prescription.model.js';
import Consultation from '../models/consultation.model.js';

export const createPrescription = async (prescriptionData) => {
  const prescription = new Prescription(prescriptionData);
  return await prescription.save();
};

export const getPrescriptionById = async (id, clinicId) => {
  return await Prescription.findOne({ _id: id, clinicId })
    .populate('patientId', 'firstName lastName')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .populate('consultationId', 'diagnosis symptoms');
};

export const getPrescriptions = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const prescriptions = await Prescription.find(filter)
    .populate('patientId', 'firstName lastName')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Prescription.countDocuments(filter);
  return {
    data: prescriptions,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updatePrescription = async (id, clinicId, updateData) => {
  // If finalized, no updates allowed (handled in controller)
  return await Prescription.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};
`;

files[path.join(BACKEND_SRC, "services", "billing.service.js")] = `
import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';

export const generateInvoiceNumber = async (clinicId) => {
  const dateStr = new Date().getFullYear().toString();
  const count = await Invoice.countDocuments({ clinicId, invoiceNumber: new RegExp(\`^INV-\${dateStr}\`) });
  return \`INV-\${dateStr}-\${(count + 1).toString().padStart(6, '0')}\`;
};

export const calculateInvoiceTotals = (items, discount = 0, tax = 0) => {
  // We calculate amounts in the backend and enforce them
  const calculatedItems = items.map(item => ({
    ...item,
    amount: item.quantity * item.unitPrice
  }));
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
  const total = Math.max(0, subtotal - discount + tax); // Prevent negative total
  
  return { items: calculatedItems, subtotal, discount, tax, total };
};

export const createInvoice = async (invoiceData) => {
  const invoiceNumber = await generateInvoiceNumber(invoiceData.clinicId);
  
  const { items, subtotal, discount, tax, total } = calculateInvoiceTotals(
    invoiceData.items, 
    invoiceData.discount || 0, 
    invoiceData.tax || 0
  );
  
  const amountDue = total;
  
  const invoice = new Invoice({
    ...invoiceData,
    invoiceNumber,
    items,
    subtotal,
    discount,
    tax,
    total,
    amountDue,
    amountPaid: 0,
    status: 'DRAFT'
  });
  
  return await invoice.save();
};

export const getInvoiceById = async (id, clinicId) => {
  return await Invoice.findOne({ _id: id, clinicId })
    .populate('patientId', 'firstName lastName patientId')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .populate('createdBy', 'name');
};

export const getInvoices = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const invoices = await Invoice.find(filter)
    .populate('patientId', 'firstName lastName patientId')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Invoice.countDocuments(filter);
  return {
    data: invoices,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateInvoice = async (id, clinicId, updateData) => {
  return await Invoice.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};

// Payments
export const recordPayment = async (paymentData, session = null) => {
  const payment = new Payment(paymentData);
  return await payment.save({ session });
};

export const getPaymentsByInvoice = async (invoiceId, clinicId) => {
  return await Payment.find({ invoiceId, clinicId })
    .populate('recordedBy', 'name')
    .sort({ paidAt: -1 });
};
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 4 Validators and Services generated");
