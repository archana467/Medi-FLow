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
