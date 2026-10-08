import { ALL_ROLES } from '../utils/roles.js';

export const validateUser = (data) => {
  const errors = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!data.email || typeof data.email !== 'string' || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push('A valid email address is required');
  }

  if (data.password && (typeof data.password !== 'string' || data.password.length < 8)) {
    errors.push('Password must be at least 8 characters');
  }

  if (!data.role || !ALL_ROLES.includes(data.role)) {
    errors.push('A valid role is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRoleUpdate = (data) => {
  const errors = [];
  if (!data.role || !ALL_ROLES.includes(data.role)) {
    errors.push('A valid role is required');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStatusUpdate = (data) => {
  const errors = [];
  if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
};
