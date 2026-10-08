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
