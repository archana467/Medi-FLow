import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.model.js';
import Invoice from '../models/invoice.model.js';
import Payment from '../models/payment.model.js';

export const getDashboardOverview = async (req, res, next) => {
  try {
    const { role, clinicId, userId } = req.user;
    
    // Build date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let summary = {};

    if (role === 'SUPER_ADMIN') {
        // Platform level logic could go here
        summary = { message: "Platform stats" };
    } else if (role === 'CLINIC_ADMIN' || role === 'RECEPTIONIST' || role === 'STAFF') {
        const [patients, doctors, todayAppointments, upcomingAppointments, pendingInvoices] = await Promise.all([
            Patient.countDocuments({ clinicId, status: 'ACTIVE' }),
            Doctor.countDocuments({ clinicId, status: 'ACTIVE' }),
            Appointment.countDocuments({ clinicId, startTime: { $gte: today, $lt: tomorrow } }),
            Appointment.countDocuments({ clinicId, startTime: { $gte: tomorrow }, status: 'SCHEDULED' }),
            Invoice.countDocuments({ clinicId, status: { $in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID'] } })
        ]);
        
        // Revenue aggregate
        const revenueAgg = await Payment.aggregate([
            { $match: { clinicId, createdAt: { $gte: today, $lt: tomorrow } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const todayRevenue = revenueAgg[0]?.total || 0;

        summary = { patients, doctors, todayAppointments, upcomingAppointments, pendingInvoices, todayRevenue };
    } else if (role === 'DOCTOR') {
        const doctor = await Doctor.findOne({ userId });
        let todayAppointments = 0;
        let upcomingAppointments = 0;
        if (doctor) {
            const counts = await Promise.all([
                Appointment.countDocuments({ doctorId: doctor._id, startTime: { $gte: today, $lt: tomorrow } }),
                Appointment.countDocuments({ doctorId: doctor._id, startTime: { $gte: tomorrow }, status: 'SCHEDULED' })
            ]);
            todayAppointments = counts[0];
            upcomingAppointments = counts[1];
        }
        summary = { todayAppointments, upcomingAppointments };
    } else if (role === 'PATIENT') {
        const patient = await Patient.findOne({ userId });
        let upcomingAppointments = [];
        if (patient) {
            upcomingAppointments = await Appointment.find({ 
                patientId: patient._id, 
                startTime: { $gte: today }, 
                status: { $in: ['SCHEDULED', 'CONFIRMED'] }
            }).sort({ startTime: 1 }).limit(5).populate('doctorId', 'userId').populate({ path: 'doctorId', populate: { path: 'userId' } });
        }
        
        summary = { upcomingAppointments };
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
