import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, Search, Filter, Plus, ChevronRight, CheckCircle, XCircle, AlertCircle, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const AppointmentsList = () => {
  const { currentUser: user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, completed, cancelled
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getAppointments({ limit: 100 });
      if (res?.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'COMPLETED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredAppts = appointments.filter(app => {
    const isUpcoming = ['SCHEDULED', 'CONFIRMED'].includes(app.status);
    const isCompleted = app.status === 'COMPLETED';
    const isCancelled = app.status === 'CANCELLED';

    if (activeTab === 'upcoming' && !isUpcoming) return false;
    if (activeTab === 'completed' && !isCompleted) return false;
    if (activeTab === 'cancelled' && !isCancelled) return false;

    if (search) {
      const searchStr = search.toLowerCase();
      const docName = app.doctorId?.userId?.name?.toLowerCase() || '';
      const patName = app.patientId?.userId?.name?.toLowerCase() || '';
      return docName.includes(searchStr) || patName.includes(searchStr);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your appointments and upcoming visits.</p>
        </div>
        {user?.role === 'PATIENT' && (
          <Link to="/appointments/book" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition-all">
            <Plus className="w-5 h-5" />
            Book Appointment
          </Link>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['upcoming', 'completed', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-6 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-48 animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                 <div className="h-3 bg-slate-200 rounded w-full"></div>
                 <div className="h-3 bg-slate-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-200 text-center font-medium">
          {error}
        </div>
      ) : filteredAppts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No {activeTab} appointments</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            You don't have any {activeTab} appointments scheduled at the moment.
          </p>
          {user?.role === 'PATIENT' && (
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Book an Appointment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppts.map(app => (
            <div key={app._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  {user?.role === 'PATIENT' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                        {app.doctorId?.userId?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">Dr. {app.doctorId?.userId?.name}</h4>
                        <p className="text-blue-600 font-medium text-sm">{app.doctorId?.specialization || 'General'}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-tr from-emerald-100 to-teal-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm">
                        {app.patientId?.userId?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{app.patientId?.userId?.name}</h4>
                        <p className="text-slate-500 font-medium text-sm">Patient</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {new Date(app.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {new Date(`2000-01-01T${app.startTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(`2000-01-01T${app.endTime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {app.clinicId?.name || 'MediFlow Clinic, Main Wing'}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <Link to="/consultations" className="flex-1 inline-flex justify-center items-center py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  View Consultations
                </Link>
                {activeTab === 'upcoming' && (
                  <button className="flex-1 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors">
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList;