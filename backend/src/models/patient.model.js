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