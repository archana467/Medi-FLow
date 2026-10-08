const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// Audit Service
files[path.join(FRONTEND_SRC, "services", "audit.service.js")] = `
import api from './api';
export const getAuditLogs = (params) => api.get('/audit-logs', { params });
`;

// Dashboard Service
files[path.join(FRONTEND_SRC, "services", "dashboard.service.js")] = `
import api from './api';
export const getDashboardOverview = () => api.get('/dashboard/overview');
`;

// Audit Logs Page
files[path.join(FRONTEND_SRC, "pages", "audit", "AuditLogsList.jsx")] = `
import { useState, useEffect } from 'react';
import { getAuditLogs } from '../../services/audit.service';

const AuditLogsList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await getAuditLogs();
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.actorUserId?.firstName} {log.actorUserId?.lastName} ({log.actorRole})</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.resourceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AuditLogsList;
`;

// Dashboard Page
files[path.join(FRONTEND_SRC, "pages", "dashboard", "Dashboard.jsx")] = `
import { useState, useEffect } from 'react';
import { getDashboardOverview } from '../../services/dashboard.service';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardOverview();
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Welcome, {user?.firstName}</h2>
      
      {(user.role === 'CLINIC_ADMIN' || user.role === 'RECEPTIONIST') && data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Today's Appointments</h3>
            <p className="text-3xl font-bold mt-2">{data.todayAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Active Patients</h3>
            <p className="text-3xl font-bold mt-2">{data.patients || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Today's Revenue</h3>
            <p className="text-3xl font-bold mt-2">₹{data.todayRevenue || 0}</p>
          </div>
        </div>
      )}

      {(user.role === 'DOCTOR') && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Today's Appointments</h3>
            <p className="text-3xl font-bold mt-2">{data.todayAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming Appointments</h3>
            <p className="text-3xl font-bold mt-2">{data.upcomingAppointments || 0}</p>
          </div>
        </div>
      )}

      {(user.role === 'PATIENT') && data && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Upcoming Appointments</h3>
          {data.upcomingAppointments?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {data.upcomingAppointments.map(app => (
                <li key={app.id} className="py-2">
                  {new Date(app.startTime).toLocaleString()} with Dr. {app.doctorId?.userId?.lastName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No upcoming appointments.</p>
          )}
        </div>
      )}
    </div>
  );
};
export default Dashboard;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 6 Frontend generated");
