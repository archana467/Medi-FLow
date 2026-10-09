import abdmService from '../services/external/abdm.service.js';
import Clinic from '../models/clinic.model.js';
import Doctor from '../models/doctor.model.js';

export const getNearbyFacilities = async (req, res, next) => {
    try {
        const { lat, lng, radius } = req.query;
        // The user wants demo data for facilities, so we just fetch all clinics.
        const clinics = await Clinic.find({ isActive: true });
        
        // Map to ABDM format for frontend compatibility
        const formatted = clinics.map(c => ({
            id: c._id,
            name: c.name,
            facilityType: 'Hospital',
            address: c.address,
            city: c.city,
            state: c.state,
            contact: c.phone
        }));

        res.status(200).json({
            success: true,
            status: 'success',
            message: 'Facilities retrieved successfully',
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};

export const searchDoctors = async (req, res, next) => {
    try {
        const { specialization, location, search } = req.query;
        
        // Build DB query
        let clinicQuery = { isActive: true };
        if (location) {
            clinicQuery.$or = [
                { city: { $regex: location, $options: 'i' } },
                { name: { $regex: location, $options: 'i' } } // allow searching by hospital name in location field
            ];
        }
        
        const clinics = await Clinic.find(clinicQuery);
        const clinicIds = clinics.map(c => c._id);

        let query = { isActive: true, clinicId: { $in: clinicIds } };
        
        if (specialization) {
            query.specialization = { $regex: specialization, $options: 'i' };
        }

        const doctors = await Doctor.find(query)
            .populate('userId', 'name email')
            .populate('clinicId', 'name city address');

        // Filter by general search string if provided
        let filteredDoctors = doctors;
        if (search) {
            const s = search.toLowerCase();
            filteredDoctors = doctors.filter(d => 
                (d.userId?.name || '').toLowerCase().includes(s) ||
                (d.specialization || '').toLowerCase().includes(s) ||
                (d.clinicId?.name || '').toLowerCase().includes(s)
            );
        }

        // Map to frontend expected format
        const formatted = filteredDoctors.map(d => ({
            id: d._id,
            name: d.userId?.name,
            registrationNumber: d.doctorCode,
            specialization: d.specialization,
            qualification: d.qualification,
            experienceYears: d.experienceYears,
            consultationFee: d.consultationFee,
            location: d.clinicId ? `${d.clinicId.city} - ${d.clinicId.name}` : 'Unknown',
            hospital: d.clinicId?.name,
            hospitalId: d.clinicId?._id
        }));
        
        res.status(200).json({
            success: true,
            status: 'success',
            message: 'Doctors retrieved successfully',
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};

export const getDoctorById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const doctor = await Doctor.findById(id)
            .populate('userId', 'name email')
            .populate('clinicId', 'name city address');

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        const DoctorAvailability = await import('../models/doctorAvailability.model.js').then(m => m.default);
        const availability = await DoctorAvailability.find({ doctorId: doctor._id, isActive: true });

        const formatted = {
            id: doctor._id,
            name: doctor.userId?.name,
            registrationNumber: doctor.doctorCode,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            experienceYears: doctor.experienceYears,
            consultationFee: doctor.consultationFee,
            location: doctor.clinicId ? `${doctor.clinicId.city} - ${doctor.clinicId.name}` : 'Unknown',
            hospital: doctor.clinicId?.name,
            hospitalId: doctor.clinicId?._id,
            availability: availability.map(a => ({
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime
            }))
        };

        res.status(200).json({
            success: true,
            status: 'success',
            data: formatted
        });
    } catch (error) {
        next(error);
    }
};
