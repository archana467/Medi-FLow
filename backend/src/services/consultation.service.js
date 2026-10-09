import Consultation from '../models/consultation.model.js';
import Appointment from '../models/appointment.model.js';

export const createConsultation = async (consultationData) => {
  const consultation = new Consultation(consultationData);
  return await consultation.save();
};

export const getConsultationById = async (id, clinicId) => {
  const query = { _id: id };
  if (clinicId) query.clinicId = clinicId;
  return await Consultation.findOne(query)
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
