import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import { sendEmail } from '../services/email.service.js';

export const emailWorker = new Worker('email', async (job) => {
  console.log(`Processing email job: ${job.id}`);
  const { to, subject, template, context } = job.data;
  
  // Simple HTML structure
  let html = `<h1>${subject}</h1><p>You have a new message from MediFlow.</p>`;
  if (template === 'appointment-confirmed') {
    html = `<p>Your appointment on ${new Date(context.date).toLocaleString()} has been confirmed.</p>`;
  } else if (template === 'appointment-reminder') {
    html = `<p>Reminder: You have an upcoming appointment on ${new Date(context.date).toLocaleString()}.</p>`;
  }
  
  await sendEmail({ to, subject, html });
  
  return { success: true };
}, { connection });

emailWorker.on('failed', (job, err) => {
  console.error(`Email Job ${job.id} failed:`, err);
});
