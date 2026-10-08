import Patient from '../models/patient.model.js';

export const generatePatientId = async (clinicId) => {
  const count = await Patient.countDocuments({ clinicId });
  return `MED-${clinicId.toString().substring(0, 4).toUpperCase()}-${(count + 1).toString().padStart(6, '0')}`;
};

export const createPatient = async (patientData) => {
  const patientId = await generatePatientId(patientData.clinicId);
  const patient = new Patient({ ...patientData, patientId });
  return await patient.save();
};

export const getPatients = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const patients = await Patient.find(filter).sort(sort).skip(skip).limit(limit);
  const total = await Patient.countDocuments(filter);
  return {
    data: patients,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getPatientById = async (id, clinicId) => {
  return await Patient.findOne({ _id: id, clinicId });
};

export const updatePatient = async (id, clinicId, updateData) => {
  return await Patient.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};
