import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClinics, createClinic, updateClinicStatus } from '../services/clinic.service';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Building2,
  Filter,
  MapPin,
  Phone,
  Mail,
  Activity,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Clinics = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', city: '', country: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClinics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getClinics();
      const data = await res.json();
      if (res.ok) {
        setClinics(data.clinics);
      } else {
        setError(data.message || 'Failed to load clinics');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClinics(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await createClinic(formData);
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', email: '', phone: '', city: '', country: '' });
        fetchClinics();
      } else {
        setFormError(data.message || data.errors?.[0] || 'Failed to create clinic');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (clinic) => {
    try {
      const res = await updateClinicStatus(clinic.id, !clinic.isActive);
      if (res.ok) fetchClinics();
    } catch {
      alert('Failed to update clinic status');
    }
  };

  const filteredClinics = clinics.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinics</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all clinics and facilities on the platform</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
            showForm 
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> New Clinic</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Create New Clinic</h2>
              <p className="text-sm text-slate-500">Register a new healthcare facility</p>
            </div>
          </div>
          
          {formError && (
            <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-lg mb-6 border border-rose-100 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {formError}
            </div>
          )}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Clinic Name *</label>
              <input
                type="text" required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. City Health Clinic"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="contact@clinic.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. New York"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. United States"
              />
            </div>
            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mr-3">
                Cancel
              </button>
              <button
                type="submit" disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {submitting ? 'Creating Clinic...' : 'Create Clinic'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters and Search */}
      {!showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Search clinics by name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      )}

      {/* Clinic List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Loading clinics...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-lg border border-rose-200 flex items-center gap-3">
          <Activity className="w-5 h-5" />
          {error}
        </div>
      ) : clinics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">No clinics yet</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">Create the first clinic to get started managing healthcare facilities on the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClinics.map(clinic => (
            <div key={clinic.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    clinic.isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${clinic.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    {clinic.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{clinic.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-4">ID: {clinic.id}</p>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <span>{[clinic.city, clinic.country].filter(Boolean).join(', ') || 'Location not specified'}</span>
                  </div>
                  
                  {(clinic.email || clinic.phone) && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      {clinic.phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                      {clinic.email && (
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{clinic.email}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                  View Details
                </button>
                <button
                  onClick={() => handleToggleStatus(clinic)}
                  className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors border ${
                    clinic.isActive
                      ? 'text-rose-600 border-rose-200 hover:bg-rose-50 bg-white'
                      : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-white'
                  }`}
                >
                  {clinic.isActive ? (
                    <><XCircle className="w-4 h-4" /> Deactivate</>
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Activate</>
                  )}
                </button>
              </div>
            </div>
          ))}
          
          {filteredClinics.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
              <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">No clinics found</h3>
              <p className="text-slate-500 text-sm">
                No clinics match your search criteria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Clinics;
