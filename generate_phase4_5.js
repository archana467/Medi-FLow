const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// Dashboard changes
files[path.join(FRONTEND_SRC, "pages", "Dashboard.jsx")] = `
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.firstName}!</h2>
      <p className="text-gray-600 mb-6">You are logged in as <strong>{user?.role}</strong>.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['SUPER_ADMIN', 'CLINIC_ADMIN', 'RECEPTIONIST'].includes(user?.role) && (
          <>
            <Link to="/patients" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
              Manage Patients
            </Link>
            <Link to="/doctors" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
              Manage Doctors
            </Link>
            <Link to="/billing" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
              Manage Billing & Invoices
            </Link>
          </>
        )}
        
        <Link to="/appointments" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
          {user?.role === 'PATIENT' ? 'My Appointments' : 'Manage Appointments'}
        </Link>
        
        <Link to="/consultations" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
          {user?.role === 'PATIENT' ? 'My Consultations' : 'Consultations'}
        </Link>
        
        <Link to="/prescriptions" className="p-4 border rounded shadow-sm hover:bg-gray-50 flex flex-col items-center justify-center text-blue-600 font-semibold">
          {user?.role === 'PATIENT' ? 'My Prescriptions' : 'Prescriptions'}
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
`;

// Minimal List pages to satisfy the requirement
files[path.join(FRONTEND_SRC, "pages", "consultations", "ConsultationsList.jsx")] = `
import { useState, useEffect } from 'react';
import { getConsultations } from '../../services/consultation.service';

const ConsultationsList = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await getConsultations();
      if (response.data.success) {
        setConsultations(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Consultations</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {consultations.map(c => (
              <tr key={c.id}>
                <td className="px-6 py-4 whitespace-nowrap">{c.patientId?.firstName} {c.patientId?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.doctorId?.userId?.name || 'Doctor'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {consultations.length === 0 && <div className="p-4 text-center text-gray-500">No consultations found.</div>}
      </div>
    </div>
  );
};
export default ConsultationsList;
`;

files[path.join(FRONTEND_SRC, "pages", "prescriptions", "PrescriptionsList.jsx")] = `
import { useState, useEffect } from 'react';
import { getPrescriptions } from '../../services/prescription.service';

const PrescriptionsList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await getPrescriptions();
      if (response.data.success) {
        setPrescriptions(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Prescriptions</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map(p => (
              <tr key={p.id}>
                <td className="px-6 py-4 whitespace-nowrap">{p.patientId?.firstName} {p.patientId?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.doctorId?.userId?.name || 'Doctor'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prescriptions.length === 0 && <div className="p-4 text-center text-gray-500">No prescriptions found.</div>}
      </div>
    </div>
  );
};
export default PrescriptionsList;
`;

files[path.join(FRONTEND_SRC, "pages", "billing", "InvoicesList.jsx")] = `
import { useState, useEffect } from 'react';
import { getInvoices } from '../../services/billing.service';

const InvoicesList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await getInvoices();
      if (response.data.success) {
        setInvoices(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Invoices & Billing</h2>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map(i => (
              <tr key={i.id}>
                <td className="px-6 py-4 whitespace-nowrap">{i.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap">{i.patientId?.firstName} {i.patientId?.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{i.total}</td>
                <td className="px-6 py-4 whitespace-nowrap">₹{i.amountDue}</td>
                <td className="px-6 py-4 whitespace-nowrap">{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <div className="p-4 text-center text-gray-500">No invoices found.</div>}
      </div>
    </div>
  );
};
export default InvoicesList;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 4 Frontend Views generated");
