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
