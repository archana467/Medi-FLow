export const validateClinic = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Clinic name is required and must be at least 2 characters');
  }

  if (data.email && (typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email))) {
    errors.push('A valid email address is required if provided');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateClinicStatus = (data) => {
  const errors = [];
  if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
