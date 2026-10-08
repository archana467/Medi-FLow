import { authFetch, API_URL } from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_URL}/api/doctors?${queryString}`);
    return response.json();
  },
  
  getDoctorById: async (id) => {
    const response = await authFetch(`${API_URL}/api/doctors/${id}`);
    return response.json();
  },
  
  createDoctor: async (doctorData) => {
    const response = await authFetch(`${API_URL}/api/doctors`, {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
    return response.json();
  },
  
  updateDoctor: async (id, doctorData) => {
    const response = await authFetch(`${API_URL}/api/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(doctorData)
    });
    return response.json();
  },
  
  getAvailability: async (doctorId) => {
    const response = await authFetch(`${API_URL}/api/doctors/${doctorId}/availability`);
    return response.json();
  },
  
  addAvailability: async (doctorId, availabilityData) => {
    const response = await authFetch(`${API_URL}/api/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify(availabilityData)
    });
    return response.json();
  },
  
  removeAvailability: async (doctorId, availabilityId) => {
    const response = await authFetch(`${API_URL}/api/doctors/${doctorId}/availability/${availabilityId}`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
