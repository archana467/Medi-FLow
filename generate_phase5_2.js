const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;
const BACKEND_SRC = path.join(BASE_DIR, "backend", "src");

const files = {};

// Queues
files[path.join(BACKEND_SRC, "queues", "notification.queue.js")] = `
import { Queue } from 'bullmq';
import connection from '../config/redis.js';

export const notificationQueue = new Queue('notification', { connection });

export const queueNotification = async (name, data, options = {}) => {
  return await notificationQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    ...options
  });
};
`;

files[path.join(BACKEND_SRC, "queues", "email.queue.js")] = `
import { Queue } from 'bullmq';
import connection from '../config/redis.js';

export const emailQueue = new Queue('email', { connection });

export const queueEmail = async (name, data, options = {}) => {
  return await emailQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    ...options
  });
};
`;

files[path.join(BACKEND_SRC, "queues", "reminder.queue.js")] = `
import { Queue } from 'bullmq';
import connection from '../config/redis.js';

export const reminderQueue = new Queue('reminder', { connection });

export const queueReminder = async (name, data, options = {}) => {
  return await reminderQueue.add(name, data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    ...options
  });
};
`;

// Workers
files[path.join(BACKEND_SRC, "workers", "notification.worker.js")] = `
import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import * as notificationService from '../services/notification.service.js';

export const notificationWorker = new Worker('notification', async (job) => {
  console.log(\`Processing notification job: \${job.id}\`);
  const { type, recipientUserId, clinicId, title, message, data } = job.data;
  
  // Persist notification (this service also handles emitting via socket if connected)
  await notificationService.createNotification({
    type,
    recipientUserId,
    clinicId,
    title,
    message,
    data
  });
  
  return { success: true };
}, { connection });

notificationWorker.on('failed', (job, err) => {
  console.error(\`Notification Job \${job.id} failed:\`, err);
});
`;

files[path.join(BACKEND_SRC, "workers", "email.worker.js")] = `
import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import { sendEmail } from '../services/email.service.js';

export const emailWorker = new Worker('email', async (job) => {
  console.log(\`Processing email job: \${job.id}\`);
  const { to, subject, template, context } = job.data;
  
  // Simple HTML structure
  let html = \`<h1>\${subject}</h1><p>You have a new message from MediFlow.</p>\`;
  if (template === 'appointment-confirmed') {
    html = \`<p>Your appointment on \${new Date(context.date).toLocaleString()} has been confirmed.</p>\`;
  } else if (template === 'appointment-reminder') {
    html = \`<p>Reminder: You have an upcoming appointment on \${new Date(context.date).toLocaleString()}.</p>\`;
  }
  
  await sendEmail({ to, subject, html });
  
  return { success: true };
}, { connection });

emailWorker.on('failed', (job, err) => {
  console.error(\`Email Job \${job.id} failed:\`, err);
});
`;

files[path.join(BACKEND_SRC, "workers", "reminder.worker.js")] = `
import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import Appointment from '../models/appointment.model.js';
import { queueNotification } from '../queues/notification.queue.js';
import { queueEmail } from '../queues/email.queue.js';

export const reminderWorker = new Worker('reminder', async (job) => {
  console.log(\`Processing reminder job: \${job.id}\`);
  const { appointmentId, clinicId } = job.data;

  // 1. Verify appointment still exists and hasn't been cancelled
  const appointment = await Appointment.findOne({ _id: appointmentId, clinicId })
    .populate('patientId', 'firstName lastName email patientId userId')
    .populate({ path: 'doctorId', populate: { path: 'userId' } });

  if (!appointment) {
    console.log(\`Appointment \${appointmentId} not found, skipping reminder.\`);
    return { success: true, skipped: true };
  }

  if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
    console.log(\`Appointment \${appointmentId} is \${appointment.status}, skipping reminder.\`);
    return { success: true, skipped: true };
  }

  // Idempotency check: A notification with this specific appointmentId and type can be checked
  // Though typically we just send it if the job runs. We rely on BullMQ job ID idempotency.

  // 2. Queue Notification for patient
  await queueNotification('appointment-reminder', {
    type: 'APPOINTMENT_REMINDER',
    recipientUserId: appointment.patientId.userId,
    clinicId,
    title: 'Appointment Reminder',
    message: \`You have an appointment on \${new Date(appointment.startTime).toLocaleString()}\`,
    data: { appointmentId: appointment._id }
  });

  // 3. Queue Email for patient
  if (appointment.patientId.email) {
    await queueEmail('send-reminder', {
      to: appointment.patientId.email,
      subject: 'Appointment Reminder',
      template: 'appointment-reminder',
      context: { date: appointment.startTime }
    });
  }

  return { success: true };
}, { connection });

reminderWorker.on('failed', (job, err) => {
  console.error(\`Reminder Job \${job.id} failed:\`, err);
});
`;

// Start Worker script
files[path.join(BACKEND_SRC, "worker.js")] = `
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

// Load workers
import './workers/notification.worker.js';
import './workers/email.worker.js';
import './workers/reminder.worker.js';

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Worker connected to MongoDB');
    console.log('BullMQ Workers started successfully.');
  })
  .catch((err) => {
    console.error('Worker MongoDB connection error', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await mongoose.connection.close();
    process.exit(0);
});
`;

Object.keys(files).forEach(filepath => {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, files[filepath].trim() + '\\n');
});

console.log("Phase 5 Queues and Workers generated");
