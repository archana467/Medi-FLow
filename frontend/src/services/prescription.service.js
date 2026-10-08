import api from './api';

export const createPrescription = (data) => api.post('/prescriptions', data);
export const getPrescriptions = (params) => api.get('/prescriptions', { params });
export const getPrescriptionById = (id) => api.get(`/prescriptions/${id}`);
export const updatePrescription = (id, data) => api.patch(`/prescriptions/${id}`, data);
export const finalizePrescription = (id) => api.post(`/prescriptions/${id}/finalize`);
