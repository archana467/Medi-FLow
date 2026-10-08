const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const FRONTEND_SRC = path.join(BASE_DIR, "frontend", "src");

const files = {};

// Socket & Notifications Frontend
files[path.join(FRONTEND_SRC, "services", "notification.service.js")] = `
import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params });
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.patch(\`/notifications/\${id}/read\`);
export const markAllAsRead = () => api.post('/notifications/mark-all-read');
`;

files[path.join(FRONTEND_SRC, "services", "socket.js")] = `
import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => console.log('Socket connected'));
    socket.on('disconnect', () => console.log('Socket disconnected'));
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
`;

// AppLayout update for Notifications
files[path.join(FRONTEND_SRC, "components", "AppLayout.jsx")] = `
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../services/notification.service';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

const AppLayout = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token && user) {
      // Connect to Socket
      const socket = connectSocket(token);
      
      // Fetch initial unread count
      getUnreadCount().then(res => {
        if (res.data?.success) setUnreadCount(res.data.data.count);
      });

      // Listen for new notifications
      socket.on('notification:new', (notification) => {
        console.log('New notification:', notification);
        setUnreadCount(prev => prev + 1);
      });

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <h1 className="text-xl font-bold text-blue-600">MediFlow</h1>
             <nav className="flex space-x-4">
                 <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
                 
                 {(user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.role === 'RECEPTIONIST') && (
                     <Link to="/patients" className="text-gray-600 hover:text-blue-600">Patients</Link>
                 )}
                 {(user?.role === 'SUPER_ADMIN' || user?.role === 'CLINIC_ADMIN' || user?.role === 'RECEPTIONIST') && (
                     <Link to="/doctors" className="text-gray-600 hover:text-blue-600">Doctors</Link>
                 )}
                 <Link to="/appointments" className="text-gray-600 hover:text-blue-600">Appointments</Link>
                 
                 <Link to="/consultations" className="text-gray-600 hover:text-blue-600">Consultations</Link>
                 <Link to="/prescriptions" className="text-gray-600 hover:text-blue-600">Prescriptions</Link>
                 
                 {(user?.role !== 'DOCTOR') && (
                     <Link to="/billing" className="text-gray-600 hover:text-blue-600">Billing</Link>
                 )}
             </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/notifications" className="relative p-2 text-gray-600 hover:text-blue-600">
               🔔
               {unreadCount > 0 && (
                 <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                   {unreadCount}
                 </span>
               )}
            </Link>
            <span className="text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
`;

files[path.join(FRONTEND_SRC, "pages", "notifications", "NotificationsList.jsx")] = `
import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import { getSocket } from '../../services/socket';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    const socket = getSocket();
    if (socket) {
      socket.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev]);
      });
    }
    return () => {
      if (socket) socket.off('notification:new');
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <button 
          onClick={handleMarkAllRead}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded shadow-sm"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {notifications.map(n => (
            <li key={n.id} className={\`p-4 \${!n.isRead ? 'bg-blue-50' : ''}\`}>
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <p className="text-gray-600">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={() => handleMarkAsRead(n.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
          {notifications.length === 0 && (
            <li className="p-4 text-center text-gray-500">No notifications yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};
export default NotificationsList;
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 5 Frontend components generated");
