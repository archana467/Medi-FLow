import api from './api';

export const createInvoice = (data) => api.post('/invoices', data);
export const getInvoices = (params) => api.get('/invoices', { params });
export const getInvoiceById = (id) => api.get(`/invoices/${id}`);
export const updateInvoiceStatus = (id, status) => api.patch(`/invoices/${id}/status`, { status });
export const recordPayment = (id, data) => api.post(`/invoices/${id}/payments`, data);
export const getPayments = (id) => api.get(`/invoices/${id}/payments`);
