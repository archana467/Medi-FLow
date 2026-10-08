const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// Patients
files[path.join(FRONTEND_SRC, "pages", "patients", "PatientsList.jsx")] = `
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { patientService } from '../../services/patient.service';

const PatientsList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await patientService.getPatients();
      if (res.success) setPatients(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add Patient
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Patient ID</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No patients found.</td>
                </tr>
              ) : (
                patients.map(p => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-600 font-mono">{p.patientId}</td>
                    <td className="p-4 font-medium text-slate-800">{p.firstName} {p.lastName}</td>
                    <td className="p-4 text-slate-600">{p.phone}</td>
                    <td className="p-4">
                      <span className={\`text-xs px-2 py-1 rounded-full \${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default PatientsList;
`;

// Doctors
files[path.join(FRONTEND_SRC, "pages", "doctors", "DoctorsList.jsx")] = `
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { doctorService } from '../../services/doctor.service';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getDoctors();
      if (res.success) setDoctors(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Doctors</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add Doctor
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Doctor Code</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Specialization</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No doctors found.</td>
                </tr>
              ) : (
                doctors.map(d => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 text-sm text-slate-600 font-mono">{d.doctorCode}</td>
                    <td className="p-4 font-medium text-slate-800">{d.userId?.name || 'Unknown'}</td>
                    <td className="p-4 text-slate-600">{d.specialization}</td>
                    <td className="p-4">
                      <span className={\`text-xs px-2 py-1 rounded-full \${d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default DoctorsList;
`;

// Appointments
files[path.join(FRONTEND_SRC, "pages", "appointments", "AppointmentsList.jsx")] = `
import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { appointmentService } from '../../services/appointment.service';

const AppointmentsList = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentService.getAppointments();
      if (res.success) setAppointments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'CONFIRMED': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'NO_SHOW': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Book Appointment
        </button>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Doctor</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-slate-500">No appointments found.</td>
                </tr>
              ) : (
                appointments.map(a => (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{a.appointmentDate}</div>
                      <div className="text-sm text-slate-500">{a.startTime} - {a.endTime}</div>
                    </td>
                    <td className="p-4 text-slate-700">
                      {a.patientId?.firstName} {a.patientId?.lastName}
                    </td>
                    <td className="p-4 text-slate-700">
                      {a.doctorId?.userId?.name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <span className={\`text-xs px-2 py-1 rounded-full \${getStatusColor(a.status)}\`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default AppointmentsList;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Generated frontend list pages successfully.");
