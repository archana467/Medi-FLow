import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Calendar as CalendarIcon, Clock, UserRound } from 'lucide-react';
import api from '../../services/api';
import { doctorService } from '../../services/doctor.service';

const BookAppointment = () => {
  const { currentUser: user } = useAuth();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const initialDoctorId = searchParams.get('doctorId') || '';

  const [formData, setFormData] = useState({
    doctorId: initialDoctorId,
    appointmentDate: '',
    startTime: '',
    reason: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await doctorService.getDoctors();
        if (res.success) {
          setDoctors(res.data);
        }
      } catch (err) {
        setError('Failed to load doctors.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId || !formData.appointmentDate || !formData.startTime) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const start = new Date(`${formData.appointmentDate}T${formData.startTime}`);
      const end = new Date(start.getTime() + 30 * 60000);
      
      const formatTime = (d) => {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
      };

      const payload = {
        doctorId: formData.doctorId,
        patientId: user.id,
        appointmentDate: formData.appointmentDate,
        startTime: formatTime(start),
        endTime: formatTime(end),
        reason: formData.reason,
        status: 'SCHEDULED'
      };
      
      const res = await api.post('/appointments', payload);
      if (res.data?.success) {
        navigate('/appointments');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(Array.isArray(err.response.data.errors) ? err.response.data.errors.join(', ') : err.response.data.errors);
      } else {
        setError(err.response?.data?.message || 'Failed to book appointment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/appointments" className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
          <p className="text-slate-500 mt-1">Schedule a visit with a doctor.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserRound className="w-4 h-4 text-blue-500" /> Select Doctor
            </label>
            {loading ? (
              <div className="w-full h-12 bg-slate-100 rounded-xl animate-pulse"></div>
            ) : (
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              >
                <option value="">-- Choose a specialist --</option>
                {doctors.map(doc => (
                  <option key={doc.id || doc._id} value={doc.id || doc._id}>
                    {doc.name?.startsWith('Dr.') ? doc.name : `Dr. ${doc.name || doc.userId?.name || 'Unknown'}`} - {doc.specialization} ({doc.hospital})
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-500" /> Date
              </label>
              <input 
                type="date"
                value={formData.appointmentDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" /> Time
              </label>
              <input 
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Reason for Visit (Optional)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="Briefly describe your symptoms or reason for booking"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
            ></textarea>
          </div>
          
          <div className="pt-4 flex gap-4">
            <Link to="/appointments" className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={submitting || loading}
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
