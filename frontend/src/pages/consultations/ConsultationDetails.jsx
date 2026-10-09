import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConsultationById } from '../../services/consultation.service';
import { ArrowLeft, UserRound, FileText, Pill, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ConsultationDetails = () => {
  const { id } = useParams();
  const { currentUser: user } = useAuth();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getConsultationById(id);
        if (res.data?.success) {
          setConsultation(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-200 rounded-xl mb-6"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-slate-800">Consultation not found</h2>
        <Link to="/consultations" className="text-blue-600 mt-4 inline-block">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/consultations" className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Details</h1>
          <p className="text-slate-500 text-sm">View details, notes, and prescriptions for this visit</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <UserRound className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {user?.role === 'PATIENT' ? `Dr. ${consultation.doctorId?.userId?.name || 'Doctor'}` : consultation.patientId?.firstName + ' ' + consultation.patientId?.lastName}
              </h3>
              <p className="text-slate-500 font-medium">{user?.role === 'PATIENT' ? 'Attending Physician' : 'Patient'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
              consultation.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {consultation.status}
            </span>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Reason for Visit</h4>
              <p className="text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100">{consultation.reason || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Symptoms & Notes</h4>
              <p className="text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">{consultation.symptoms || consultation.notes || 'No symptoms recorded.'}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Calendar className="w-4 h-4"/> Schedule</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Date</span>
                  <span className="font-semibold">{new Date(consultation.appointmentId?.appointmentDate || consultation.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Time</span>
                  <span className="font-semibold">{consultation.appointmentId?.startTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Pill className="w-4 h-4"/> Associated Records</h4>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <p className="text-slate-500 text-sm mb-3">No prescriptions associated with this consultation yet.</p>
                {user?.role === 'DOCTOR' && (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
                    Add Prescription
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationDetails;
