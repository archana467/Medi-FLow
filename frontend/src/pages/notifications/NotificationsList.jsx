import { useState, useEffect } from 'react';
import { getNotifications, markAsRead, markAllAsRead } from '../../services/notification.service';
import { getSocket } from '../../services/socket';
import { Bell, Check, CheckCircle2, Clock } from 'lucide-react';

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
      if (response.data?.success || Array.isArray(response.data)) {
        setNotifications(response.data.data || response.data || []);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">Stay updated with your latest alerts</p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-600 mb-4"></div>
          <p className="text-slate-500 font-medium">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">You're all caught up!</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">You have no new notifications right now.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-5 transition-colors flex gap-4 ${!n.isRead ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'bg-white hover:bg-slate-50'}`}
              >
                <div className={`mt-1 shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  !n.isRead ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <h3 className={`text-sm font-semibold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                  <p className={`text-sm ${!n.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                    {n.message}
                  </p>
                  
                  {!n.isRead && (
                    <div className="mt-3">
                      <button 
                        onClick={() => handleMarkAsRead(n.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
                
                {!n.isRead && (
                  <div className="shrink-0 flex items-center">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
