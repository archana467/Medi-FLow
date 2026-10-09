import React, { useState } from 'react';
import api from '../../services/api';
import { Search, Stethoscope, Award, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  
  const handleSearch = async (e) => {
      e?.preventDefault();
      setLoading(true);
      setError('');
      try {
          const res = await api.get(`/external/doctors/search?specialization=${encodeURIComponent(specialization)}&location=${encodeURIComponent(location)}`);
          if (res.data?.success) {
              setDoctors(res.data.data);
          } else {
              setError(res.data?.message || 'Failed to search doctors');
          }
      } catch (err) {
          setError(err.response?.data?.message || 'An error occurred during search');
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ABDM Doctor Search</h1>
        <p className="text-sm text-slate-500 mt-1">Search for verified healthcare professionals nationwide</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Specialization</label>
               <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Cardiologist, Dentist..."
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
               <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Mumbai, Delhi..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
               />
            </div>
         </div>
         <div className="mt-4 flex justify-end">
             <button type="submit" disabled={loading} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search Doctors'}
             </button>
         </div>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            <div className="col-span-full py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
                <p className="text-slate-500">Searching global registry...</p>
            </div>
        ) : doctors.length > 0 ? (
            doctors.map((doctor, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                            <span className="text-xs text-slate-500 font-mono mt-1 block">Reg: {doctor.registrationNumber || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3 mt-2 flex-1">
                        <div className="flex items-center text-sm text-slate-600">
                            <Award className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            {doctor.specialization || 'General Practitioner'}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                            {doctor.location || 'Location not specified'}
                        </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
                        <Link to={`/external/doctors/${doctor.id || doctor._id}`} className="flex-1 text-center bg-slate-50 text-slate-700 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-100 transition-colors">
                            View Profile
                        </Link>
                        <Link to={`/appointments/book?doctorId=${doctor.id || doctor._id}`} className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                            Book
                        </Link>
                    </div>
                </div>
            ))
        ) : (
            <div className="col-span-full py-12 text-center text-slate-500">
                Enter search criteria to find verified doctors.
            </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors;
