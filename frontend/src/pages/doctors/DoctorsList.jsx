import React, { useEffect, useState } from 'react';
import { doctorService } from '../../services/doctor.service';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Stethoscope, 
  Award,
  Phone,
  Mail,
  FileText
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const DoctorsList = () => {
  const { currentUser: user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredDoctors = doctors.filter(d => 
    d.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.doctorCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
          <p className="text-sm text-slate-500 mt-1">Manage medical staff and specialists</p>
        </div>
        {user?.role !== 'PATIENT' && (
          <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Add Doctor
          </button>
        )}
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Search doctors by name, specialization, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
            <p className="text-slate-500 font-medium">Loading doctors...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="px-6 py-4">Doctor Info</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <Stethoscope className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-slate-900 font-medium mb-1">No doctors found</p>
                      <p className="text-slate-500 text-sm">
                        {searchQuery ? "Try adjusting your search terms." : "Get started by adding a new doctor."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map(d => (
                    <tr key={d.id || d._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                            {d.userId?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Dr. {d.userId?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">Code: {d.doctorCode || d._id?.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-slate-700">
                          <Award className="w-4 h-4 mr-2 text-slate-400" />
                          {d.specialization || 'General'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {d.phone && (
                            <div className="flex items-center text-sm text-slate-600">
                              <Phone className="w-3.5 h-3.5 mr-2 text-slate-400" />
                              {d.phone}
                            </div>
                          )}
                          <div className="flex items-center text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
                            {d.userId?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          d.isActive !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${d.isActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {d.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View Profile">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
