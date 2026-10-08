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
