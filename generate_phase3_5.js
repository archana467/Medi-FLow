const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

files[path.join(FRONTEND_SRC, "services", "patient.service.js")] = `
import { authFetch, API_URL } from './api';

export const patientService = {
  getPatients: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(\`\${API_URL}/api/patients?\${queryString}\`);
    return response.json();
  },
  
  getPatientById: async (id) => {
    const response = await authFetch(\`\${API_URL}/api/patients/\${id}\`);
    return response.json();
  },
  
  createPatient: async (patientData) => {
    const response = await authFetch(\`\${API_URL}/api/patients\`, {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
    return response.json();
  },
  
  updatePatient: async (id, patientData) => {
    const response = await authFetch(\`\${API_URL}/api/patients/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(patientData)
    });
    return response.json();
  },
  
  updatePatientStatus: async (id, isActive) => {
    const response = await authFetch(\`\${API_URL}/api/patients/\${id}/status\`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
    return response.json();
  }
};
`;

files[path.join(FRONTEND_SRC, "services", "doctor.service.js")] = `
import { authFetch, API_URL } from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(\`\${API_URL}/api/doctors?\${queryString}\`);
    return response.json();
  },
  
  getDoctorById: async (id) => {
    const response = await authFetch(\`\${API_URL}/api/doctors/\${id}\`);
    return response.json();
  },
  
  createDoctor: async (doctorData) => {
    const response = await authFetch(\`\${API_URL}/api/doctors\`, {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
    return response.json();
  },
  
  updateDoctor: async (id, doctorData) => {
    const response = await authFetch(\`\${API_URL}/api/doctors/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(doctorData)
    });
    return response.json();
  },
  
  getAvailability: async (doctorId) => {
    const response = await authFetch(\`\${API_URL}/api/doctors/\${doctorId}/availability\`);
    return response.json();
  },
  
  addAvailability: async (doctorId, availabilityData) => {
    const response = await authFetch(\`\${API_URL}/api/doctors/\${doctorId}/availability\`, {
      method: 'POST',
      body: JSON.stringify(availabilityData)
    });
    return response.json();
  },
  
  removeAvailability: async (doctorId, availabilityId) => {
    const response = await authFetch(\`\${API_URL}/api/doctors/\${doctorId}/availability/\${availabilityId}\`, {
      method: 'DELETE'
    });
    return response.json();
  }
};
`;

files[path.join(FRONTEND_SRC, "services", "appointment.service.js")] = `
import { authFetch, API_URL } from './api';

export const appointmentService = {
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await authFetch(\`\${API_URL}/api/appointments?\${queryString}\`);
    return response.json();
  },
  
  getAppointmentById: async (id) => {
    const response = await authFetch(\`\${API_URL}/api/appointments/\${id}\`);
    return response.json();
  },
  
  createAppointment: async (appointmentData) => {
    const response = await authFetch(\`\${API_URL}/api/appointments\`, {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  },
  
  updateAppointment: async (id, appointmentData) => {
    const response = await authFetch(\`\${API_URL}/api/appointments/\${id}\`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  },
  
  updateAppointmentStatus: async (id, statusData) => {
    const response = await authFetch(\`\${API_URL}/api/appointments/\${id}/status\`, {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    });
    return response.json();
  }
};
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Generated frontend API services successfully.");
