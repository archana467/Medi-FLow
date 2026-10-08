import React from 'react';
import { Shield, Bell, Lock, Key, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
           <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl flex items-center gap-3">
             <Lock className="w-5 h-5"/> Security
           </button>
           <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl flex items-center gap-3 transition">
             <Bell className="w-5 h-5"/> Notifications
           </button>
           <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl flex items-center gap-3 transition">
             <Shield className="w-5 h-5"/> Privacy
           </button>
           <button className="w-full text-left px-4 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl flex items-center gap-3 transition">
             <SettingsIcon className="w-5 h-5"/> Preferences
           </button>
        </div>
        
        <div className="md:col-span-3">
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
             <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Key className="w-5 h-5 text-blue-500" /> Change Password
             </h2>
             <form className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-1">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"/>
                </div>
                <button type="button" className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition">
                  Update Password
                </button>
             </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
