import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUserRole, updateUserStatus } from '../services/user.service';
import { getClinics } from '../services/clinic.service';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Users as UsersIcon,
  Filter,
  Shield,
  Activity,
  UserCheck,
  UserX
} from 'lucide-react';

const ROLES = ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'];

const ROLE_BADGE = {
  SUPER_ADMIN: 'bg-purple-50 text-purple-700 border-purple-200 bg-purple-500',
  CLINIC_ADMIN: 'bg-blue-50 text-blue-700 border-blue-200 bg-blue-500',
  DOCTOR: 'bg-emerald-50 text-emerald-700 border-emerald-200 bg-emerald-500',
  RECEPTIONIST: 'bg-amber-50 text-amber-700 border-amber-200 bg-amber-500',
  PATIENT: 'bg-slate-50 text-slate-700 border-slate-200 bg-slate-500'
};

const Users = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isClinicAdmin = currentUser?.role === 'CLINIC_ADMIN';

  const [users, setUsers] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'DOCTOR', clinicId: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, clinicsRes] = await Promise.all([
        getUsers(),
        isSuperAdmin ? getClinics() : Promise.resolve(null)
      ]);
      const usersData = await usersRes.json();
      if (usersRes.ok) setUsers(usersData.users);
      else setError(usersData.message || 'Failed to load users');

      if (clinicsRes) {
        const clinicsData = await clinicsRes.json();
        if (clinicsRes.ok) setClinics(clinicsData.clinics);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!isSuperAdmin) {
        delete payload.clinicId; // backend derives it from token
        delete payload.role; // pre-fill allowed roles only — we'll keep it
      }
      const res = await createUser(payload);
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: '', email: '', password: '', role: 'DOCTOR', clinicId: '' });
        fetchAll();
      } else {
        setFormError(data.message || data.errors?.[0] || 'Failed to create user');
      }
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateUserStatus(user.id, !user.isActive);
      fetchAll();
    } catch { alert('Failed to update user status'); }
  };

  // Roles a clinic admin is allowed to assign
  const allowedRoles = isSuperAdmin
    ? ROLES
    : ['DOCTOR', 'RECEPTIONIST', 'PATIENT'];

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isSuperAdmin ? 'Manage all platform users and roles' : 'Manage users in your clinic'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm ${
            showForm 
              ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> New User</>}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Create New User</h2>
              <p className="text-sm text-slate-500">Add a new user to the system</p>
            </div>
          </div>
          
          {formError && (
            <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-lg mb-6 border border-rose-100 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {formError}
            </div>
          )}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="e.g. Dr. Jane Smith"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Email Address *</label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="jane@clinic.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Password *</label>
              <input type="password" required minLength={8} value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Role *</label>
              <select value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                {allowedRoles.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            
            {isSuperAdmin && (
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Assign to Clinic {formData.role !== 'SUPER_ADMIN' ? '*' : '(Optional)'}
                </label>
                <select value={formData.clinicId}
                  onChange={e => setFormData({ ...formData, clinicId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  <option value="">-- System Level (No Clinic) --</option>
                  {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            
            <div className="md:col-span-2 flex justify-end pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors mr-3">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? 'Creating User...' : 'Create User'}
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
              placeholder="Search users by name, email, or role..."
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

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Loading users...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 text-rose-600 text-sm p-4 rounded-lg border border-rose-200 flex items-center gap-3">
          <Activity className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">No users found</h3>
              <p className="text-slate-500 text-sm">
                {searchQuery ? "No users match your search criteria." : "Create the first user to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Access</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredUsers.map(user => {
                    const badgeClass = ROLE_BADGE[user.role] || ROLE_BADGE.PATIENT;
                    const [bgColor, textColor, borderColor, dotColor] = badgeClass.split(' ');
                    
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${bgColor} ${textColor}`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{user.name}</div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${bgColor} ${textColor} ${borderColor}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                            <div className="text-xs text-slate-500 flex items-center">
                              {user.clinicId
                                ? (clinics.find(c => c.id === user.clinicId)?.name || <span className="font-mono">ID: {user.clinicId.substring(0, 8)}...</span>)
                                : <span className="text-slate-400 font-medium">System Wide Access</span>
                              }
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            user.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            {user.id !== currentUser?.id && user.role !== 'SUPER_ADMIN' && (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`p-2 rounded-lg transition-colors border ${
                                  user.isActive 
                                    ? 'text-rose-600 border-rose-200 hover:bg-rose-50 bg-white' 
                                    : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-white'
                                }`}
                                title={user.isActive ? "Deactivate User" : "Activate User"}
                              >
                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            )}
                            <button className="p-2 text-slate-400 border border-transparent hover:border-slate-200 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;
