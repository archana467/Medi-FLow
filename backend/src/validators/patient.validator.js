export const validatePatient = (data) => {
  const errors = [];
  if (!data.firstName || data.firstName.trim().length < 2) errors.push('Valid first name is required');
  if (!data.lastName || data.lastName.trim().length < 2) errors.push('Valid last name is required');
  if (!data.dateOfBirth) errors.push('Date of birth is required');
  if (!['Male', 'Female', 'Other'].includes(data.gender)) errors.push('Valid gender is required');
  if (!data.phone || data.phone.trim().length < 5) errors.push('Valid phone number is required');
  
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.push('Valid email is required');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePatientStatus = (data) => {
  const errors = [];
  if (typeof data.isActive !== 'boolean') errors.push('isActive must be a boolean');
  return {
    isValid: errors.length === 0,
    errors
  };
};
