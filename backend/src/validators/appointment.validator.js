import { APPOINTMENT_STATUS_LIST } from '../utils/constants.js';

export const validateAppointment = (data) => {
  const errors = [];
  if (!data.patientId) errors.push('patientId is required');
  if (!data.doctorId) errors.push('doctorId is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.appointmentDate)) errors.push('Valid appointmentDate is required (YYYY-MM-DD)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) errors.push('Valid startTime is required (HH:mm)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.endTime)) errors.push('Valid endTime is required (HH:mm)');
  
  if (data.startTime >= data.endTime) errors.push('startTime must be before endTime');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateAppointmentStatus = (data) => {
  const errors = [];
  if (!APPOINTMENT_STATUS_LIST.includes(data.status)) errors.push('Valid status is required');
  return {
    isValid: errors.length === 0,
    errors
  };
};
