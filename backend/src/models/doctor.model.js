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