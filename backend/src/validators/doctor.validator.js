export const validateDoctor = (data) => {
  const errors = [];
  if (!data.userId) errors.push('userId is required');
  if (!data.specialization || data.specialization.trim().length < 2) errors.push('Valid specialization is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateDoctorAvailability = (data) => {
  const errors = [];
  if (data.dayOfWeek < 0 || data.dayOfWeek > 6) errors.push('dayOfWeek must be between 0 and 6');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.startTime)) errors.push('Valid startTime is required (HH:mm)');
  if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(data.endTime)) errors.push('Valid endTime is required (HH:mm)');
  
  if (data.startTime >= data.endTime) errors.push('startTime must be before endTime');
  if (!data.slotDuration || data.slotDuration <= 0) errors.push('Valid slotDuration is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};
