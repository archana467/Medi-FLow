const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// API Services
files[path.join(FRONTEND_SRC, "services", "consultation.service.js")] = `
import api from './api';

export const createConsultation = (data) => api.post('/consultations', data);
export const getConsultations = (params) => api.get('/consultations', { params });
export const getConsultationById = (id) => api.get(\`/consultations/\${id}\`);
export const updateConsultation = (id, data) => api.patch(\`/consultations/\${id}\`, data);
export const completeConsultation = (id) => api.post(\`/consultations/\${id}/complete\`);
`;

files[path.join(FRONTEND_SRC, "services", "prescription.service.js")] = `
import api from './api';

export const createPrescription = (data) => api.post('/prescriptions', data);
export const getPrescriptions = (params) => api.get('/prescriptions', { params });
export const getPrescriptionById = (id) => api.get(\`/prescriptions/\${id}\`);
export const updatePrescription = (id, data) => api.patch(\`/prescriptions/\${id}\`, data);
export const finalizePrescription = (id) => api.post(\`/prescriptions/\${id}/finalize\`);
`;

files[path.join(FRONTEND_SRC, "services", "billing.service.js")] = `
import api from './api';

export const createInvoice = (data) => api.post('/invoices', data);
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(\`/invoices/\${id}\`);
export const updateInvoiceStatus = (id, status) => api.patch(\`/invoices/\${id}/status\`, { status });
export const recordPayment = (id, data) => api.post(\`/invoices/\${id}/payments\`, data);
export const getPayments = (id) => api.get(\`/invoices/\${id}/payments\`);
`;

// AppLayout update for Navigation
files[path.join(FRONTEND_SRC, "components", "AppLayout.jsx")] = `
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-blue-600">MediFlow</h1>
             <nav className="flex space-x-4">
                 <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
                 
                 {(user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.role === 'RECEPTIONIST') && (
                     <Link to="/patients" className="text-gray-600 hover:text-blue-600">Patients</Link>
                 )}
                 {(user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.role === 'RECEPTIONIST') && (
                     <Link to="/doctors" className="text-gray-600 hover:text-blue-600">Doctors</Link>
                 )}
                 <Link to="/appointments" className="text-gray-600 hover:text-blue-600">Appointments</Link>
                 
                 <Link to="/consultations" className="text-gray-600 hover:text-blue-600">Consultations</Link>
                 <Link to="/prescriptions" className="text-gray-600 hover:text-blue-600">Prescriptions</Link>
                 
                 {(user?.role !== 'DOCTOR') && (
                     <Link to="/billing" className="text-gray-600 hover:text-blue-600">Billing</Link>
                 )}
             </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 4 Frontend Services generated");
