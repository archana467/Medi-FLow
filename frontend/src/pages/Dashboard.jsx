import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDashboardOverview } from '../services/dashboard.service';
import { getConsultations } from '../services/consultation.service';
import { getPrescriptions } from '../services/prescription.service';
import { getInvoices } from '../services/billing.service';
import {
  Calendar, MessageSquare, FileText, CreditCard, Clock, Activity, 
  ArrowRight, Search, Plus, Shield, CheckCircle, Pill, UserRound, MapPin, 
  Heart, Zap, CalendarDays
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser: user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [extraData, setExtraData] = useState({ consultations: [], prescriptions: [], invoices: [], activity: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getDashboardOverview();
        
        let extra = { consultations: [], prescriptions: [], invoices: [], activity: [] };
        if (user?.role === 'PATIENT') {
          const [consRes, presRes, invRes] = await Promise.all([
            getConsultations({ limit: 3 }).catch(() => ({ data: { data: [] } })),
            getPrescriptions({ limit: 3, status: 'ACTIVE' }).catch(() => ({ data: { data: [] } })),
            getInvoices({ limit: 3 }).catch(() => ({ data: { data: [] } }))
          ]);
          extra.consultations = consRes.data?.data || [];
          extra.prescriptions = presRes.data?.data || [];
          extra.invoices = invRes.data?.data || [];
        }
        if (res.data?.success) setData(res.data.data);
        setExtraData(extra);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div className="p-8 animate-pulse space-y-6"><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="grid grid-cols-4 gap-6"><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div><div className="h-32 bg-slate-200 rounded-2xl"></div></div></div>;
  }

  const upcomingAppt = data?.upcomingAppointments?.[0];
  const pendingInv = extraData.invoices.filter(i => i.status !== 'PAID');
  const totalBilled = extraData.invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const totalPaid = extraData.invoices.filter(i => i.status === 'PAID').reduce((acc, i) => acc + i.totalAmount, 0);

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      
      {/* MAIN LEFT AREA (Approx 75% on large screens) */}
      <div className="flex-1 space-y-6">
        
        {/* Welcome & Date */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
               Good morning, {user?.name?.split(' ')[0]} <span className="text-3xl">👋</span>
            </h1>
            <p className="text-slate-500 mt-1">Here's your health overview for today.</p>
          </div>
          <p className="text-sm font-medium text-slate-500">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CalendarDays className="w-5 h-5"/></div>
              <span className="font-semibold text-slate-700 text-sm">Upcoming Appointments</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900">{data?.upcomingAppointments?.length || 0}</h3>
              <p className="text-xs text-slate-500 mt-1">No upcoming appointments</p>
            </div>
            <Link to="/appointments" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">Book Appointment <ArrowRight className="w-4 h-4"/></Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><MessageSquare className="w-5 h-5"/></div>
              <span className="font-semibold text-slate-700 text-sm">Consultations</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900">{extraData.consultations.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Total consultations</p>
            </div>
            <Link to="/consultations" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">View All <ArrowRight className="w-4 h-4"/></Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Pill className="w-5 h-5"/></div>
              <span className="font-semibold text-slate-700 text-sm">Prescriptions</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900">{extraData.prescriptions.length}</h3>
              <p className="text-xs text-slate-500 mt-1">Active prescriptions</p>
            </div>
            <Link to="/prescriptions" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">View All <ArrowRight className="w-4 h-4"/></Link>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5"/></div>
              <span className="font-semibold text-slate-700 text-sm">Pending Bills</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-900">₹{pendingInv.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-1">{pendingInv.length} invoice pending</p>
            </div>
            <Link to="/billing" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2">View Billing <ArrowRight className="w-4 h-4"/></Link>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Left Inner (Next Appt & Consultations) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Your Next Appointment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[300px]">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600"/> Your Next Appointment
              </h3>
              {upcomingAppt ? (
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-2xl">
                      {upcomingAppt.doctorId?.userId?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-900 text-xl">Dr. {upcomingAppt.doctorId?.userId?.name}</h4>
                       <p className="text-slate-500 font-medium">{upcomingAppt.doctorId?.specialization || 'General'}</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded-full">{upcomingAppt.status}</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 flex gap-6 mt-2">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Date</p>
                      <p className="font-bold text-slate-900">{new Date(upcomingAppt.appointmentDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Time</p>
                      <p className="font-bold text-slate-900">{new Date(`2000-01-01T${upcomingAppt.startTime}`).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                     <button className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">View Details</button>
                     <button className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Reschedule</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center bg-blue-50/30 rounded-xl border border-dashed border-blue-100 p-6 relative overflow-hidden">
                   <div className="absolute right-4 bottom-4 w-24 h-24 bg-blue-100 rounded-full opacity-50 flex items-center justify-center"><Calendar className="w-12 h-12 text-blue-500 opacity-50"/></div>
                   <div className="w-14 h-14 bg-white text-blue-500 rounded-xl shadow-sm flex items-center justify-center mb-4 z-10"><CalendarDays className="w-7 h-7" /></div>
                   <h4 className="font-bold text-slate-900 z-10 text-lg">No upcoming Appointments</h4>
                   <p className="text-slate-500 text-sm mb-6 z-10">You don't have any appointments scheduled yet.</p>
                   <Link to="/appointments" className="z-10 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 text-sm"><Plus className="w-4 h-4"/> Book Appointment</Link>
                </div>
              )}
            </div>

            {/* Recent Consultations */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500"/> Recent Consultations
                </h3>
                <Link to="/consultations" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ArrowRight className="w-4 h-4"/></Link>
              </div>
              <div className="divide-y divide-slate-100">
                {extraData.consultations.length > 0 ? (
                  extraData.consultations.slice(0, 3).map((c, i) => (
                    <div key={i} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                           <img src={`https://ui-avatars.com/api/?name=Dr+${c.doctorId?.userId?.name}&background=f1f5f9&color=475569`} alt="Dr"/>
                         </div>
                         <div>
                            <h4 className="font-bold text-sm text-slate-900">Dr. {c.doctorId?.userId?.name || 'Unknown'}</h4>
                            <p className="text-xs text-slate-500 font-medium">{c.doctorId?.specialization || 'Cardiology'}</p>
                         </div>
                      </div>
                      <div className="hidden sm:block">
                         <p className="text-sm font-bold text-slate-900">{new Date(c.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                         <p className="text-xs text-slate-500">{c.reason || 'Follow-up consultation'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="hidden md:inline-block px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">Completed</span>
                         <Link to="/consultations" className="text-sm font-semibold text-blue-600 flex items-center gap-1 hover:underline">View <ArrowRight className="w-3 h-3"/></Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-slate-500">No recent consultations found.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right Inner (Quick Actions & Prescriptions) */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Quick Actions */}
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-[300px]">
               <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                 <Zap className="w-5 h-5 text-amber-500 fill-amber-500"/> Quick Actions
               </h3>
               <div className="grid grid-cols-2 gap-4">
                  <Link to="/appointments" className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition group flex flex-col h-full">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition"><CalendarDays className="w-4 h-4"/></div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">Book Appointment</h4>
                    <p className="text-xs text-slate-500 mb-2 flex-1">Find a doctor and schedule a visit</p>
                    <ArrowRight className="w-4 h-4 text-blue-600 self-end"/>
                  </Link>
                  <Link to="/doctors" className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition group flex flex-col h-full">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition"><UserRound className="w-4 h-4"/></div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">Find a Doctor</h4>
                    <p className="text-xs text-slate-500 mb-2 flex-1">Search specialists near you</p>
                    <ArrowRight className="w-4 h-4 text-blue-600 self-end"/>
                  </Link>
                  <Link to="/prescriptions" className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 hover:bg-emerald-50/30 transition group flex flex-col h-full">
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition"><Pill className="w-4 h-4"/></div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">View Prescriptions</h4>
                    <p className="text-xs text-slate-500 mb-2 flex-1">Check your current medicines</p>
                    <ArrowRight className="w-4 h-4 text-blue-600 self-end"/>
                  </Link>
                  <Link to="/consultations" className="border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:bg-slate-50/80 transition group flex flex-col h-full">
                    <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center mb-3 group-hover:bg-slate-600 group-hover:text-white transition"><FileText className="w-4 h-4"/></div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-tight">View Medical Records</h4>
                    <p className="text-xs text-slate-500 mb-2 flex-1">Access your health history</p>
                    <ArrowRight className="w-4 h-4 text-blue-600 self-end"/>
                  </Link>
               </div>
             </div>

             {/* Active Prescriptions */}
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-blue-600"/> Active Prescriptions
                  </h3>
                  <Link to="/prescriptions" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All Prescriptions <ArrowRight className="w-3 h-3"/></Link>
                </div>
                <div className="space-y-3">
                  {extraData.prescriptions.length > 0 ? (
                    extraData.prescriptions.flatMap(p => p.medicines).slice(0, 2).map((m, i) => (
                      <div key={i} className="border border-slate-100 rounded-xl p-4 flex gap-4 hover:border-blue-100 hover:shadow-sm transition">
                         <div className="mt-1"><Pill className="w-5 h-5 text-blue-400" /></div>
                         <div className="flex-1">
                            <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{m.dosage} • {m.frequency} • {m.duration}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{m.instructions}</p>
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-xs font-medium text-slate-500 flex items-center gap-1"><UserRound className="w-3 h-3"/> Dr. Prescriber</span>
                              <Link to="/prescriptions" className="text-xs font-semibold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">View <ArrowRight className="w-3 h-3"/></Link>
                            </div>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-sm text-slate-500 py-6">No active prescriptions.</p>
                  )}
                </div>
             </div>

          </div>
        </div>

        {/* Bottom Wide Section: Billing Overview */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600"/> Billing Overview
            </h3>
            <Link to="/billing" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View All <ArrowRight className="w-4 h-4"/></Link>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-stretch">
             {/* Stats */}
             <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="bg-[#f8fafc] rounded-xl p-4 flex gap-3 border border-slate-100">
                   <div className="mt-1"><Clock className="w-4 h-4 text-blue-500"/></div>
                   <div>
                     <p className="text-xs font-semibold text-slate-500 mb-1">Total Billed</p>
                     <p className="font-bold text-lg text-slate-900">₹{totalBilled.toLocaleString()}</p>
                   </div>
                </div>
                <div className="bg-[#f0fdf4] rounded-xl p-4 flex gap-3 border border-emerald-100">
                   <div className="mt-1"><CheckCircle className="w-4 h-4 text-emerald-500"/></div>
                   <div>
                     <p className="text-xs font-semibold text-slate-500 mb-1">Paid</p>
                     <p className="font-bold text-lg text-emerald-700">₹{totalPaid.toLocaleString()}</p>
                   </div>
                </div>
                <div className="bg-[#fff7ed] rounded-xl p-4 flex gap-3 border border-orange-100">
                   <div className="mt-1"><Clock className="w-4 h-4 text-orange-500"/></div>
                   <div>
                     <p className="text-xs font-semibold text-slate-500 mb-1">Pending</p>
                     <p className="font-bold text-lg text-orange-600">₹{pendingInv.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}</p>
                   </div>
                </div>
             </div>
             
             {/* Latest Invoice */}
             <div className="lg:w-80 border-l border-slate-100 pl-6 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-sm">Latest Invoice</h4>
                  <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded border border-orange-200">Pending</span>
                </div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Invoice {extraData.invoices[0] ? '#' + extraData.invoices[0].invoiceNumber : '#MF-1024'}</p>
                    <p className="text-xs text-slate-400 mt-1">Consultation • {new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</p>
                  </div>
                  <p className="font-bold text-lg text-slate-900">₹{extraData.invoices[0]?.totalAmount || '1,250'}</p>
                </div>
                <div className="flex gap-2">
                   <button className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">View Invoice</button>
                   <button className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">Pay Now</button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR PANEL (Approx 25% on large screens) */}
      <div className="w-full xl:w-80 space-y-6">
        
        {/* Promotional Box */}
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center relative overflow-hidden">
          <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-blue-500 fill-blue-500"/>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">Your Health Matters</h3>
          <p className="text-sm text-slate-600 mb-6">Stay consistent with your checkups for a healthier tomorrow.</p>
          <button className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-sm transition">Book Appointment</button>
        </div>

        {/* Health Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Heart className="w-4 h-4 text-slate-700 fill-slate-700"/> Health Summary
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Blood Group</span>
               <span className="text-sm font-semibold text-slate-900">O+</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Allergies</span>
               <span className="text-sm font-semibold text-slate-900">None recorded</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Age</span>
               <span className="text-sm font-semibold text-slate-900">26 years</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Gender</span>
               <span className="text-sm font-semibold text-slate-900 capitalize">{user?.gender || 'Female'}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Last Visit</span>
               <span className="text-sm font-semibold text-slate-900">Oct 6, 2026</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-slate-500">Primary Doctor</span>
               <span className="text-sm font-semibold text-slate-900">Dr. Rahul Sharma</span>
             </div>
          </div>
          <button className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View Full Profile <ArrowRight className="w-4 h-4"/></button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Clock className="w-4 h-4 text-slate-700"/> Recent Activity
          </h3>
          <div className="relative border-l border-slate-200 ml-3 space-y-6">
             <div className="relative pl-6">
                <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                <p className="text-xs font-bold text-slate-900 mb-1">Today</p>
                <p className="text-sm text-slate-600">Prescription updated</p>
             </div>
             <div className="relative pl-6">
                <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-white"></span>
                <p className="text-xs font-bold text-slate-900 mb-1">Oct 6</p>
                <p className="text-sm text-slate-600">Consultation completed</p>
             </div>
             <div className="relative pl-6">
                <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
                <p className="text-xs font-bold text-slate-900 mb-1">Oct 3</p>
                <p className="text-sm text-slate-600">Appointment booked</p>
             </div>
             <div className="relative pl-6">
                <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                <p className="text-xs font-bold text-slate-900 mb-1">Sep 28</p>
                <p className="text-sm text-slate-600">Invoice generated</p>
             </div>
          </div>
          <button className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">View Full Activity <ArrowRight className="w-4 h-4"/></button>
        </div>

      </div>

    </div>
  );
};
export default Dashboard;