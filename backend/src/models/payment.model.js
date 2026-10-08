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
