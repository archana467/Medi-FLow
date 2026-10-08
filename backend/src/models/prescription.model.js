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
