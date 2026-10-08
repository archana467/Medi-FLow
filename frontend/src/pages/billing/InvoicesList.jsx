import React, { useState, useEffect } from 'react';
import { getInvoices } from '../../services/billing.service';
import { CreditCard, Search, Calendar, FileText, Download, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const InvoicesList = () => {
  const { currentUser: user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });

  useEffect(() => {
    const fetchInv = async () => {
      try {
        const res = await getInvoices({ limit: 100 });
        if (res.data?.success) {
          const invs = res.data.data;
          setInvoices(invs);
          
          let t = 0, pa = 0, pe = 0;
          invs.forEach(i => {
             t += i.totalAmount;
             if(i.status === 'PAID') pa += i.totalAmount;
             else pe += i.totalAmount;
          });
          setStats({ total: t, paid: pa, pending: pe, overdue: 0 });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInv();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage your invoices and payments.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-slate-500 mb-2">Total Billed</p>
          <h3 className="text-3xl font-bold text-slate-900">₹{stats.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-emerald-600 mb-2">Paid</p>
          <h3 className="text-3xl font-bold text-slate-900">₹{stats.paid}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-amber-600 mb-2">Pending</p>
          <h3 className="text-3xl font-bold text-slate-900">₹{stats.pending}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-semibold text-rose-600 mb-2">Overdue</p>
          <h3 className="text-3xl font-bold text-slate-900">₹{stats.overdue}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-bold text-slate-900">Recent Invoices</h3>
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Invoice ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length > 0 ? invoices.map(i => (
                <tr key={i._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">#{i.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ₹{i.totalAmount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${i.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {i.status === 'PAID' ? <CheckCircle className="w-3.5 h-3.5"/> : <Clock className="w-3.5 h-3.5"/>}
                      {i.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 mr-4">View</button>
                    {i.status !== 'PAID' && <button className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg">Pay Now</button>}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p>No invoices found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default InvoicesList;