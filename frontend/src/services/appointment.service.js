import { authFetch, API_URL } from './api';

export const appointmentService = {
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(`${API_URL}/api/appointments?${queryString}`);
    return response.json();
  },
  
  getAppointmentById: async (id) => {
    const response = await authFetch(`${API_URL}/api/appointments/${id}`);
    return response.json();
  },
  
  createAppointment: async (appointmentData) => {
    const response = await authFetch(`${API_URL}/api/appointments`, {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await authFetch(`${API_URL}/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  },
  
  updateAppointmentStatus: async (id, statusData) => {
    const response = await authFetch(`${API_URL}/api/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
    return response.json();
  }
};
