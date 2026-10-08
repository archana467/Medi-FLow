import Clinic from '../models/clinic.model.js';

export const createClinic = async (data) => {
  const clinic = new Clinic({
    name: data.name,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    isActive: data.isActive !== undefined ? data.isActive : true
  });

  await clinic.save();
  return clinic;
};

export const getClinics = async (filter = {}) => {
  return await Clinic.find(filter).sort({ createdAt: -1 });
};

export const getClinicById = async (clinicId) => {
  return await Clinic.findById(clinicId);
};

export const updateClinic = async (clinicId, data) => {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    const error = new Error('Clinic not found');
    error.statusCode = 404;
    throw error;
  }

  // Update only allowed fields
  const allowedUpdates = ['name', 'email', 'phone', 'address', 'city', 'state', 'country'];
  allowedUpdates.forEach((field) => {
    if (data[field] !== undefined) {
      clinic[field] = data[field];
    }
  });

  await clinic.save();
  return clinic;
};

export const updateClinicStatus = async (clinicId, isActive) => {
  const clinic = await Clinic.findById(clinicId);
  if (!clinic) {
    const error = new Error('Clinic not found');
    error.statusCode = 404;
    throw error;
  }

  clinic.isActive = isActive;
  await clinic.save();
  return clinic;
};
