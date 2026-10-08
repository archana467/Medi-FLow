import React, { useState, useEffect } from 'react';
import { getPrescriptions } from '../../services/prescription.service';
import { FileText, Search, Pill, Calendar, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PrescriptionsList = () => {
  const { currentUser: user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPres = async () => {
      try {
        const res = await getPrescriptions({ limit: 100 });
        if (res.data?.success) setPrescriptions(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPres();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>
          <p className="text-slate-500 mt-1">Access and manage your medical prescriptions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search medicines..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-200 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
          <div className="mx-auto w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Prescriptions Found</h3>
          <p className="text-slate-500">You don't have any prescriptions recorded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prescriptions.map(p => (
            <div key={p._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1">Prescription #{p._id.slice(-6).toUpperCase()}</h4>
                  <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4"/> {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Dr. {p.doctorId?.userId?.name || 'Doctor'}</p>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-md ${p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-slate-50/50 space-y-3">
                {p.medicines?.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><Pill className="w-4 h-4"/></div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{m.name}</p>
                        <p className="text-xs font-medium text-slate-500">{m.dosage} • {m.frequency}</p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{m.duration}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button className="flex-1 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">View Details</button>
                <button className="flex-1 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4"/> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default PrescriptionsList;