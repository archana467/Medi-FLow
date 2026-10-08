import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRound, Mail, Phone, MapPin, Calendar as CalendarIcon, Shield } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { currentUser: user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // If patient, we could fetch their patient record. Otherwise just user.
        // For simplicity, we just use the user object and maybe fetch /auth/me for fresh data
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          setProfile(res.data.user);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 mt-1">Manage your personal information and preferences.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 h-64 animate-pulse shadow-sm"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full p-1 shadow-md">
              <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <UserRound className="w-10 h-10" />
              </div>
            </div>
            <div className="absolute right-6 top-6 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
              <Shield className="w-3 h-3" /> {user?.role}
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8 border-b border-slate-100">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{profile?.name || user?.name}</h2>
                <p className="text-slate-500 mt-1 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> {profile?.email || user?.email}
                </p>
              </div>
              <button className="px-5 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Personal Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                  <p className="font-medium text-slate-800">{profile?.name || user?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="font-medium text-slate-800">{profile?.email || user?.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                  <p className="font-medium text-slate-800 capitalize">{user?.role?.toLowerCase()}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
               <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Account Info</h3>
               <div className="space-y-4">
                 <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="font-medium text-slate-800">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                 </div>
                 <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Account Status</p>
                  <p className="font-medium text-emerald-600 flex items-center gap-1">Active</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
