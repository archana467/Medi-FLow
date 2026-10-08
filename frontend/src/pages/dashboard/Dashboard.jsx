import { useState, useEffect } from 'react';
import { getDashboardOverview } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { currentUser: user } = useAuth();
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
      
      {(user?.role === 'CLINIC_ADMIN' || user?.role === 'RECEPTIONIST') && data && (
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

      {(user?.role === 'DOCTOR') && data && (
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

      {(user?.role === 'PATIENT') && data && (
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
