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
