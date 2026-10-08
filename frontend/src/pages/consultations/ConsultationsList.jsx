import React, { useState, useEffect } from 'react';
import { getConsultations } from '../../services/consultation.service';
import { MessageSquare, Calendar, Search, FileText, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ConsultationsList = () => {
  const { currentUser: user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');

  useEffect(() => {
    const fetchCons = async () => {
      try {
        const res = await getConsultations({ limit: 100 });
        if (res.data?.success) setConsultations(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCons();
  }, []);

  const filtered = consultations.filter(c => 
    activeTab === 'completed' ? c.status === 'COMPLETED' : c.status !== 'COMPLETED'
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
          <p className="text-slate-500 mt-1">Review your past visits and doctor notes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['upcoming', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search consultations..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No {activeTab} consultations</h3>
          <p className="text-slate-500">You don't have any {activeTab} consultations to show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><UserRound className="w-6 h-6"/></div>
                    <div>
                       <h4 className="font-bold text-slate-900">Dr. {c.doctorId?.userId?.name || 'Doctor'}</h4>
                       <p className="text-xs font-medium text-slate-500">{c.doctorId?.specialization || 'General'}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-full">{c.status}</span>
                </div>
                <h5 className="font-semibold text-slate-900 mb-2">{c.reason || 'General Consultation'}</h5>
                <p className="text-sm text-slate-600 line-clamp-2">{c.symptoms || c.notes || 'No additional notes provided.'}</p>
              </div>
              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Calendar className="w-4 h-4"/> {new Date(c.createdAt).toLocaleDateString()}
                </div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default ConsultationsList;