import Doctor from '../models/doctor.model.js';
import DoctorAvailability from '../models/doctorAvailability.model.js';
import User from '../models/user.model.js';

export const generateDoctorCode = async (clinicId) => {
  const count = await Doctor.countDocuments({ clinicId });
  return `DOC-${clinicId.toString().substring(0, 4).toUpperCase()}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createDoctor = async (doctorData) => {
  const doctorCode = await generateDoctorCode(doctorData.clinicId);
  const doctor = new Doctor({ ...doctorData, doctorCode });
  return await doctor.save();
};

export const getDoctors = async (filter, skip = 0, limit = 10) => {
  const doctors = await Doctor.find(filter).populate('userId', 'name email').skip(skip).limit(limit);
  const total = await Doctor.countDocuments(filter);
  return {
    data: doctors,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getDoctorById = async (id, clinicId) => {
  return await Doctor.findOne({ _id: id, clinicId }).populate('userId', 'name email');
};

export const getDoctorByUserId = async (userId, clinicId) => {
  return await Doctor.findOne({ userId, clinicId });
};

export const updateDoctor = async (id, clinicId, updateData) => {
  return await Doctor.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};

// Availability
export const createAvailability = async (availabilityData) => {
  const availability = new DoctorAvailability(availabilityData);
  return await availability.save();
};

export const getAvailability = async (doctorId, clinicId) => {
  return await DoctorAvailability.find({ doctorId, clinicId }).sort({ dayOfWeek: 1, startTime: 1 });
};

export const deleteAvailability = async (id, clinicId) => {
  return await DoctorAvailability.findOneAndDelete({ _id: id, clinicId });
};

export const checkAvailabilityOverlap = async (doctorId, clinicId, dayOfWeek, startTime, endTime) => {
  return await DoctorAvailability.findOne({
    doctorId,
    clinicId,
    dayOfWeek,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
};
