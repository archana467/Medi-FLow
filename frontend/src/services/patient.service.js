import { authFetch, API_URL } from './api';

export const patientService = {
  getPatients: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_URL}/api/patients?${queryString}`);
    return response.json();
  },
  
  getPatientById: async (id) => {
    const response = await authFetch(`${API_URL}/api/patients/${id}`);
    return response.json();
  },
  
  createPatient: async (patientData) => {
    const response = await authFetch(`${API_URL}/api/patients`, {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    return response.json();
  },
  
  updatePatient: async (id, patientData) => {
    const response = await authFetch(`${API_URL}/api/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
    return response.json();
  },
  
  updatePatientStatus: async (id, isActive) => {
    const response = await authFetch(`${API_URL}/api/patients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
    return response.json();
  }
};
