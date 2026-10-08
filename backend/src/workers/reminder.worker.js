import { Worker } from 'bullmq';
import connection from '../config/redis.js';
import Appointment from '../models/appointment.model.js';
import { queueNotification } from '../queues/notification.queue.js';
import { queueEmail } from '../queues/email.queue.js';

export const reminderWorker = new Worker('reminder', async (job) => {
  console.log(`Processing reminder job: ${job.id}`);
  const { appointmentId, clinicId } = job.data;

  // 1. Verify appointment still exists and hasn't been cancelled
  const appointment = await Appointment.findOne({ _id: appointmentId, clinicId })
    .populate('patientId', 'firstName lastName email patientId userId')
    .populate({ path: 'doctorId', populate: { path: 'userId' } });

  if (!appointment) {
    console.log(`Appointment ${appointmentId} not found, skipping reminder.`);
    return { success: true, skipped: true };
  }

  if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
    console.log(`Appointment ${appointmentId} is ${appointment.status}, skipping reminder.`);
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
    message: `You have an appointment on ${new Date(appointment.startTime).toLocaleString()}`,
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
  console.error(`Reminder Job ${job.id} failed:`, err);
});
