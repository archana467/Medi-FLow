const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Redis config
files[path.join(BACKEND_SRC, "config", "redis.js")] = `
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Important for BullMQ
  enableReadyCheck: false
});

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const getRedisStatus = () => {
  return connection.status === 'ready' ? 'connected' : 'disconnected';
};

export default connection;
`;

// Models
files[path.join(BACKEND_SRC, "models", "notification.model.js")] = `
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date }
  },
  { timestamps: true }
);

notificationSchema.index({ clinicId: 1, recipientUserId: 1 });
notificationSchema.index({ recipientUserId: 1, isRead: 1 });

notificationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

export default mongoose.model('Notification', notificationSchema);
`;

// Services - Email
files[path.join(BACKEND_SRC, "services", "email.service.js")] = `
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log(\`Mock sending email to \${to}: \${subject}\`);
    return true; // Skip actual sending if SMTP is not configured
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"MediFlow" <noreply@mediflow.com>',
    to,
    subject,
    html
  });
  return info;
};
`;

// Services - Notification
files[path.join(BACKEND_SRC, "services", "notification.service.js")] = `
import Notification from '../models/notification.model.js';
import { getSocketIo } from '../socket/socket.js';

export const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  
  // Try sending real-time update
  try {
    const io = getSocketIo();
    if (io) {
      io.to(\`user:\${data.recipientUserId}\`).emit('notification:new', notification.toJSON());
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
`;

// Socket.io Setup
files[path.join(BACKEND_SRC, "socket", "socket.js")] = `
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(\`Socket connected: \${socket.id} (User: \${socket.user._id})\`);
    
    // Join personal user room
    socket.join(\`user:\${socket.user._id}\`);
    
    socket.on('disconnect', () => {
      console.log(\`Socket disconnected: \${socket.id}\`);
    });
  });

  return io;
};

export const getSocketIo = () => {
  if (!io) {
    // We shouldn't throw error if not initialized, as workers don't run the socket server
    return null;
  }
  return io;
};
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 5 Base infra generated");
