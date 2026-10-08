import { PRESCRIPTION_STATUS_LIST } from '../utils/constants.js';

export const validatePrescription = (data) => {
  const errors = [];
  if (!data.consultationId) errors.push('consultationId is required');
  if (data.medicines && !Array.isArray(data.medicines)) errors.push('medicines must be an array');
  
  if (data.medicines) {
    data.medicines.forEach((m, index) => {
      if (!m.name || !m.dosage || !m.frequency || !m.duration) {
        errors.push(`Medicine at index ${index} is missing required fields (name, dosage, frequency, duration)`);
      }
    });
  }
  
  return { isValid: errors.length === 0, errors };
};
