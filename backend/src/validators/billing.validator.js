import { INVOICE_STATUS_LIST, PAYMENT_METHOD_LIST } from '../utils/constants.js';

export const validateInvoice = (data) => {
  const errors = [];
  if (!data.patientId) errors.push('patientId is required');
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one invoice item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.description || item.quantity === undefined || item.unitPrice === undefined) {
        errors.push(`Item at index ${index} is missing required fields`);
      } else if (item.quantity < 1) {
        errors.push(`Item at index ${index} must have quantity >= 1`);
      } else if (item.unitPrice < 0) {
        errors.push(`Item at index ${index} must have unitPrice >= 0`);
      }
    });
  }
  if (data.discount < 0) errors.push('discount cannot be negative');
  if (data.tax < 0) errors.push('tax cannot be negative');
  
  return { isValid: errors.length === 0, errors };
};

export const validatePayment = (data) => {
  const errors = [];
  if (!data.amount || data.amount <= 0) errors.push('amount must be greater than 0');
  if (!PAYMENT_METHOD_LIST.includes(data.method)) errors.push('Valid payment method is required');
  return { isValid: errors.length === 0, errors };
};
