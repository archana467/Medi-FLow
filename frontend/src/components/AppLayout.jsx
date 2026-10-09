import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notification.service';
import { connectSocket, disconnectSocket } from '../services/socket';
import {
  LayoutDashboard, UserRound, Calendar, MessageSquare, FileText, 
  CreditCard, Settings, LogOut, Bell, Menu, X, Activity, Search,
  ChevronLeft, ChevronRight, User, Pill, FileClock, Sun, Building2
} from 'lucide-react';

const AppLayout = () => {
  const { currentUser: user, logout } = useAuth();
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const location = useLocation();
  
  const [unreadCount, setUnreadCount] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (token && user) {
      const socket = connectSocket(token);
      getUnreadCount().then(res => {
        if (res.data?.success) setUnreadCount(res.data.data.count || 3);
      });
      socket.on('notification:new', () => setUnreadCount(prev => prev + 1));
      return () => {
        socket.off('notification:new');
        disconnectSocket();
      };
    }
  }, [token, user]);

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Appointments', path: '/appointments', icon: Calendar },
    { name: 'Find a Doctor', path: '/doctors', icon: UserRound },
    { name: 'Global Doctors', path: '/external/doctors', icon: Search },
    { name: 'Nearby Hospitals', path: '/external/hospitals', icon: Building2 },
    { name: 'Consultations', path: '/consultations', icon: MessageSquare },
    { name: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { name: 'Medical Records', path: '/records', icon: FileClock },
    { name: 'Billing', path: '/billing', icon: CreditCard },
  ];

  const bottomNavItems = [
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Dark theme exactly as requested */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-[#0f172a] text-slate-300 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col ${isCollapsed ? 'w-20' : 'w-72'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 text-white font-bold text-xl tracking-tight">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white"><Activity className="w-6 h-6" /></div>
              <div>
                <div className="leading-tight">MediFlow</div>
                <div className="text-[10px] text-slate-400 font-normal">Smart Healthcare</div>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 mx-auto bg-blue-500 rounded-full flex items-center justify-center text-white"><Activity className="w-6 h-6" /></div>
          )}
          <button className="lg:hidden text-slate-400 ml-auto" onClick={() => setIsMobileMenuOpen(false)}><X className="w-6 h-6" /></button>
        </div>

        {/* Main Nav */}
        <div className="flex-1 py-6 overflow-y-auto px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} title={isCollapsed ? item.name : ''}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'hover:bg-slate-800 hover:text-white'}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
          
          <div className="my-6 border-t border-slate-800/50"></div>
          
          {/* Bottom Nav */}
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} title={isCollapsed ? item.name : ''}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} strokeWidth={isActive ? 2.5 : 2} />
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
                {!isCollapsed && item.badge > 0 && (
                   <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800/50">
          {!isCollapsed ? (
            <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-700">
                      <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=334155&color=fff`} alt="Avatar" className="w-full h-full object-cover"/>
                   </div>
                   <div>
                     <p className="text-sm font-bold text-white truncate">{user?.name || 'Archana Mishra'}</p>
                     <p className="text-xs font-medium text-slate-400 truncate capitalize">{user?.role?.toLowerCase() || 'Patient'}</p>
                   </div>
                 </div>
                 <ChevronRight className="w-4 h-4 text-slate-500"/>
               </div>
               <button onClick={handleLogout} className="flex items-center gap-3 w-full px-2 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors">
                 <LogOut className="w-4 h-4" /> Logout
               </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full flex justify-center text-slate-400 hover:text-white transition-colors" title="Logout">
              <LogOut className="w-6 h-6" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 z-30 sticky top-0 shrink-0">
          
          <div className="flex items-center gap-4 flex-1">
            <button className="lg:hidden text-slate-500 hover:text-slate-900 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Search Bar - left aligned */}
            <div className="hidden md:flex items-center gap-3 bg-[#F8FAFC] px-4 py-2.5 rounded-xl border border-slate-100 w-full max-w-md focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-4 h-4 text-blue-500" />
              <input type="text" placeholder="Search doctors, appointments, prescriptions..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400" />
              <div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-md">
                <span className="text-[10px] font-bold text-slate-400">Ctrl + K</span>
              </div>
            </div>
          </div>
          
          {/* Header Right Actions */}
          <div className="flex items-center gap-6">
            
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">3</span>
            </button>
            
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Sun className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
               <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                  <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=f1f5f9&color=0f172a`} alt="Avatar" className="w-full h-full object-cover"/>
               </div>
               <div className="hidden sm:block">
                 <p className="text-sm font-bold text-slate-900 leading-tight">{user?.name || 'Archana Mishra'}</p>
                 <p className="text-[11px] font-medium text-slate-500 capitalize">{user?.role?.toLowerCase() || 'Patient'}</p>
               </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F4F7FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;