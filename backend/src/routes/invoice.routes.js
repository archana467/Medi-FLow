import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/rbac.middleware.js';
import { requireTenant } from '../middleware/tenant.middleware.js';
import * as invoiceController from '../controllers/invoice.controller.js';

const router = express.Router();

router.use(requireAuth);
router.use(requireTenant);

router.post('/', authorizeRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoiceById);

// Issue / Cancel / generic status updates
router.patch('/:id/status', authorizeRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.updateInvoiceStatus);

// Payments
router.post('/:id/payments', authorizeRoles('CLINIC_ADMIN', 'RECEPTIONIST', 'SUPER_ADMIN'), invoiceController.recordPayment);
router.get('/:id/payments', invoiceController.getPayments);

export default router;
