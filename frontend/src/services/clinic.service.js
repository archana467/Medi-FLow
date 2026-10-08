import { authFetch, API_URL } from './api';

export const getClinics = async () => {
  return authFetch(`${API_URL}/api/clinics`);
};

export const getClinicById = async (clinicId) => {
  return authFetch(`${API_URL}/api/clinics/${clinicId}`);
};

export const createClinic = async (data) => {
  return authFetch(`${API_URL}/api/clinics`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateClinic = async (clinicId, data) => {
  return authFetch(`${API_URL}/api/clinics/${clinicId}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const updateClinicStatus = async (clinicId, isActive) => {
  return authFetch(`${API_URL}/api/clinics/${clinicId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive })
  });
};
