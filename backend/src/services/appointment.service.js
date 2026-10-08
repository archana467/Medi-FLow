import Appointment from '../models/appointment.model.js';
import DoctorAvailability from '../models/doctorAvailability.model.js';
import { queueNotification } from '../queues/notification.queue.js';
import { queueReminder } from '../queues/reminder.queue.js';

export const createAppointment = async (appointmentData) => {
  const appointment = new Appointment(appointmentData);
  // Queue Notification
  await queueNotification('appointment-created', {
    type: 'APPOINTMENT_CREATED',
    recipientUserId: (await appointment.populate('patientId')).patientId.userId,
    clinicId,
    title: 'Appointment Scheduled',
    message: `Your appointment on ${new Date(appointmentData.startTime).toLocaleString()} is scheduled.`,
    data: { appointmentId: appointment._id }
  }).catch(err => console.error('Failed to queue notification:', err));

  // Schedule Reminder (e.g. 24 hours before)
  const reminderTime = new Date(appointmentData.startTime).getTime() - 24 * 60 * 60 * 1000;
  const delay = reminderTime - Date.now();
  if (delay > 0) {
    await queueReminder('send-reminder', {
        appointmentId: appointment._id,
        clinicId
    }, { delay }).catch(err => console.error('Failed to queue reminder:', err));
  }

  return await appointment.save();
};

export const getAppointments = async (filter, skip = 0, limit = 10, sort = { appointmentDate: -1, startTime: -1 }) => {
  const appointments = await Appointment.find(filter)
    .populate('patientId', 'firstName lastName phone')
    .populate('doctorId', 'specialization')
    .populate({
      path: 'doctorId',
      populate: {
        path: 'userId',
        select: 'name email'
      }
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Appointment.countDocuments(filter);
  return {
    data: appointments,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getAppointmentById = async (id, clinicId) => {
  return await Appointment.findOne({ _id: id, clinicId })
    .populate('patientId')
    .populate('doctorId');
};

export const updateAppointment = async (id, clinicId, updateData) => {
  return await Appointment.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};

export const checkAppointmentOverlap = async (doctorId, clinicId, appointmentDate, startTime, endTime) => {
  return await Appointment.findOne({
    doctorId,
    clinicId,
    appointmentDate,
    status: { $nin: ['CANCELLED', 'NO_SHOW'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
};

export const checkDoctorAvailability = async (doctorId, clinicId, dateString, startTime, endTime) => {
  const date = new Date(dateString);
  const dayOfWeek = date.getDay();
  
  const availability = await DoctorAvailability.findOne({
    doctorId,
    clinicId,
    dayOfWeek,
    isActive: true,
    startTime: { $lte: startTime },
    endTime: { $gte: endTime }
  });
  
  return !!availability;
};
