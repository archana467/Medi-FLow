import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Stethoscope, Award, MapPin, Building2, Phone, Mail, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/external/doctors/${id}`);
        if (res.data?.success) {
          setDoctor(res.data.data);
        } else {
          setError(res.data?.message || 'Failed to fetch doctor details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching details');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
        fetchDoctorDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl text-center">
        <p className="font-bold mb-2">Error</p>
        <p>{error || 'Doctor not found'}</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Profile</h1>
          <p className="text-slate-500 mt-1">View details and book an appointment</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        
        {/* Profile Info */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="-mt-12 w-24 h-24 bg-white rounded-2xl p-1 shadow-md border border-slate-100 flex-shrink-0">
              <div className="w-full h-full bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-3xl">
                {(doctor.name || doctor.userId?.name || 'D').charAt(0)}
              </div>
            </div>
            
            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {doctor.name?.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name || doctor.userId?.name || 'Unknown'}`}
                  </h2>
                  <p className="text-blue-600 font-medium flex items-center gap-1.5 mt-1">
                    <Award className="w-4 h-4" /> {doctor.specialization || 'General Practitioner'}
                  </p>
                </div>
                
                {user?.role === 'PATIENT' && (
                  <Link to={`/appointments/book?doctorId=${doctor.id}`} className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    Book Appointment
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Left Column */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Professional Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Registration Number</p>
                      <p className="text-sm text-slate-500">{doctor.registrationNumber || doctor.doctorCode || 'N/A'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Status</p>
                      <p className="text-sm text-slate-500">{doctor.isActive !== false ? 'Active & Accepting Patients' : 'Currently Unavailable'}</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Contact & Location</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Primary Hospital/Clinic</p>
                      <p className="text-sm text-slate-500">{doctor.hospital || doctor.clinicId?.name || 'Not specified'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Location</p>
                      <p className="text-sm text-slate-500">{doctor.location || doctor.clinicId?.city || 'Not specified'}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-slate-50 text-slate-500 rounded-lg">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Phone</p>
                      <p className="text-sm text-slate-500">{doctor.phone || 'N/A'}</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Working Hours</h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                {doctor.availability && doctor.availability.length > 0 ? (
                  <ul className="space-y-3">
                    {doctor.availability.map((av, idx) => (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700 capitalize">
                           {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][av.dayOfWeek]}
                        </span>
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {av.startTime} - {av.endTime}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-900">No Schedule Available</p>
                    <p className="text-xs text-slate-500 mt-1">This doctor has not updated their working hours.</p>
                  </div>
                )}
              </div>
              
              {user?.role === 'PATIENT' && (
                 <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                   <h4 className="font-bold text-blue-900 text-sm mb-1">Ready to book?</h4>
                   <p className="text-blue-700 text-xs mb-3">Select "Book Appointment" to choose a date and time that works for you.</p>
                   <Link to={`/appointments/book?doctorId=${doctor.id}`} className="w-full inline-flex justify-center items-center px-4 py-2 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors text-sm">
                     Book Now
                   </Link>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
