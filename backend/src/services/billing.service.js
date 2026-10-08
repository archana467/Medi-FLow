import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';
import { queueNotification } from '../queues/notification.queue.js';

export const generateInvoiceNumber = async (clinicId) => {
  const dateStr = new Date().getFullYear().toString();
  const count = await Invoice.countDocuments({ clinicId, invoiceNumber: new RegExp(`^INV-${dateStr}`) });
  return `INV-${dateStr}-${(count + 1).toString().padStart(6, '0')}`;
};

export const calculateInvoiceTotals = (items, discount = 0, tax = 0) => {
  // We calculate amounts in the backend and enforce them
  const calculatedItems = items.map(item => ({
    ...item,
    amount: item.quantity * item.unitPrice
  }));
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);
  const total = Math.max(0, subtotal - discount + tax); // Prevent negative total
  
  return { items: calculatedItems, subtotal, discount, tax, total };
};

export const createInvoice = async (invoiceData) => {
  const invoiceNumber = await generateInvoiceNumber(invoiceData.clinicId);
  
  const { items, subtotal, discount, tax, total } = calculateInvoiceTotals(
    invoiceData.items, 
    invoiceData.discount || 0, 
    invoiceData.tax || 0
  );
  
  const amountDue = total;
  
  const invoice = new Invoice({
    ...invoiceData,
    invoiceNumber,
    items,
    subtotal,
    discount,
    tax,
    total,
    amountDue,
    amountPaid: 0,
    status: 'DRAFT'
  });
  
  return await invoice.save();
};

export const getInvoiceById = async (id, clinicId) => {
  return await Invoice.findOne({ _id: id, clinicId })
    .populate('patientId', 'firstName lastName patientId')
    .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
    .populate('createdBy', 'name');
};

export const getInvoices = async (filter, skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  const invoices = await Invoice.find(filter)
    .populate('patientId', 'firstName lastName patientId')
    .sort(sort)
    .skip(skip)
    .limit(limit);
    
  const total = await Invoice.countDocuments(filter);
  return {
    data: invoices,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const updateInvoice = async (id, clinicId, updateData) => {
  return await Invoice.findOneAndUpdate({ _id: id, clinicId }, updateData, { new: true, runValidators: true });
};

// Payments
export const recordPayment = async (paymentData, session = null) => {
  const payment = new Payment(paymentData);
  const savedPayment = await payment.save({ session });
  
  // Inform Patient
  if (paymentData.patientId) {
     queueNotification('payment-received', {
        type: 'PAYMENT_RECEIVED',
        recipientUserId: (await Payment.findById(savedPayment._id).populate('patientId')).patientId.userId,
        clinicId: paymentData.clinicId,
        title: 'Payment Received',
        message: `We have received your payment of ₹${paymentData.amount}.`,
        data: { invoiceId: paymentData.invoiceId }
     }).catch(err => console.error('Queue notification error', err));
  }
  
  return savedPayment;
};

export const getPaymentsByInvoice = async (invoiceId, clinicId) => {
  return await Payment.find({ invoiceId, clinicId })
    .populate('recordedBy', 'name')
    .sort({ paidAt: -1 });
};
