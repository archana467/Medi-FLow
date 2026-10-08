import Notification from '../models/notification.model.js';
import { getSocketIo } from '../socket/socket.js';

export const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  
  // Try sending real-time update
  try {
    const io = getSocketIo();
    if (io) {
      io.to(`user:${data.recipientUserId}`).emit('notification:new', notification.toJSON());
    }
  } catch (err) {
    console.error('Socket error emitting notification', err);
  }
  
  return notification;
};

export const getNotifications = async (recipientUserId, skip = 0, limit = 20) => {
  const notifications = await Notification.find({ recipientUserId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Notification.countDocuments({ recipientUserId });
  
  return {
    data: notifications,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getUnreadCount = async (recipientUserId) => {
  return await Notification.countDocuments({ recipientUserId, isRead: false });
};

export const markAsRead = async (notificationId, recipientUserId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, recipientUserId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export const markAllAsRead = async (recipientUserId) => {
  return await Notification.updateMany(
    { recipientUserId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};
