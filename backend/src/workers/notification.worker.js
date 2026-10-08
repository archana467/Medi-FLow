import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import * as notificationService from '../services/notification.service.js';

export const notificationWorker = new Worker('notification', async (job) => {
  console.log(`Processing notification job: ${job.id}`);
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
  console.error(`Notification Job ${job.id} failed:`, err);
});