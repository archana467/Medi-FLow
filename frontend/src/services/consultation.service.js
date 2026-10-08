import api from './api';

export const createConsultation = (data) => api.post('/consultations', data);
export const getConsultations = (params) => api.get('/consultations', { params });
export const getConsultationById = (id) => api.get(`/consultations/${id}`);
export const updateConsultation = (id, data) => api.patch(`/consultations/${id}`, data);
export const completeConsultation = (id) => api.post(`/consultations/${id}/complete`);
