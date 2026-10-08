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
