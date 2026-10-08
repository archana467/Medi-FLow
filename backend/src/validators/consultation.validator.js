import { CONSULTATION_STATUS_LIST } from '../utils/constants.js';

export const validateConsultation = (data) => {
  const errors = [];
  if (!data.appointmentId) errors.push('appointmentId is required');
  return { isValid: errors.length === 0, errors };
};

export const validateConsultationStatus = (data) => {
  const errors = [];
  if (!CONSULTATION_STATUS_LIST.includes(data.status)) errors.push('Valid status is required');
  return { isValid: errors.length === 0, errors };
};
