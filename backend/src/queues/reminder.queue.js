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
