import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

import Clinic from './models/clinic.model.js';
import User from './models/user.model.js';
import Doctor from './models/doctor.model.js';
import Patient from './models/patient.model.js';
import DoctorAvailability from './models/doctorAvailability.model.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mediflow';

const runSeed = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create Hospitals
        const hospitalsData = [
            {
                name: 'CityCare Multispeciality Hospital',
                city: 'Ahmedabad', state: 'Gujarat', address: 'SG Highway, Ahmedabad',
                phone: '+91 79 4000 1001', email: 'contact@citycare.demo'
            },
            {
                name: 'Sunrise Medical Centre',
                city: 'Vadodara', state: 'Gujarat', address: 'Alkapuri, Vadodara',
                phone: '+91 265 4000 1002', email: 'contact@sunrise.demo'
            },
            {
                name: 'Medistar Hospital',
                city: 'Mumbai', state: 'Maharashtra', address: 'Andheri West, Mumbai',
                phone: '+91 22 4000 1003', email: 'contact@medistar.demo'
            }
        ];

        const clinics = {};
        for (const h of hospitalsData) {
            let clinic = await Clinic.findOne({ email: h.email });
            if (!clinic) {
                clinic = await Clinic.create(h);
            }
            clinics[h.name] = clinic;
        }
        console.log('Hospitals seeded');

        // Archana Patient
        const patientEmail = 'archana@demo.com'; // Adjust to whatever is actually there if you want, or just create it
        let archanaUser = await User.findOne({ email: patientEmail });
        if (!archanaUser) {
            const salt = await bcrypt.genSalt(10);
            archanaUser = await User.create({
                name: 'Archana Mishra',
                email: patientEmail,
                passwordHash: await bcrypt.hash('password123', salt),
                role: 'PATIENT'
            });
        }
        
        let archanaPatient = await Patient.findOne({ userId: archanaUser._id });
        if (!archanaPatient) {
            // Need a clinicId for patient in this architecture. Let's just assign one.
            archanaPatient = await Patient.create({
                userId: archanaUser._id,
                clinicId: clinics['CityCare Multispeciality Hospital']._id,
                patientId: 'PAT-0001',
                firstName: 'Archana',
                lastName: 'Mishra',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Female',
                phone: '+91 9876543210',
                email: archanaUser.email
            });
        }
        console.log('Patient Archana seeded');

        // Doctors
        const doctorsData = [
            { name: 'Dr. Rahul Sharma', email: 'rahul@demo.com', specialization: 'Cardiologist', qualification: 'MBBS, MD Cardiology', exp: 12, hosp: 'CityCare Multispeciality Hospital', fee: 800 },
            { name: 'Dr. Priya Patel', email: 'priya@demo.com', specialization: 'Gynecologist', qualification: 'MBBS, MD Obstetrics & Gynecology', exp: 9, hosp: 'CityCare Multispeciality Hospital', fee: 700 },
            { name: 'Dr. Amit Mehta', email: 'amit@demo.com', specialization: 'Orthopedic', qualification: 'MBBS, MS Orthopedics', exp: 14, hosp: 'Sunrise Medical Centre', fee: 900 },
            { name: 'Dr. Neha Shah', email: 'neha@demo.com', specialization: 'Dermatologist', qualification: 'MBBS, MD Dermatology', exp: 8, hosp: 'Sunrise Medical Centre', fee: 600 },
            { name: 'Dr. Arjun Desai', email: 'arjun@demo.com', specialization: 'General Physician', qualification: 'MBBS, MD Medicine', exp: 10, hosp: 'Medistar Hospital', fee: 500 },
            { name: 'Dr. Sneha Joshi', email: 'sneha@demo.com', specialization: 'Pediatrician', qualification: 'MBBS, MD Pediatrics', exp: 11, hosp: 'Medistar Hospital', fee: 650 },
            { name: 'Dr. Vikram Singh', email: 'vikram@demo.com', specialization: 'Neurologist', qualification: 'MBBS, MD Neurology', exp: 15, hosp: 'CityCare Multispeciality Hospital', fee: 1000 },
            { name: 'Dr. Anjali Verma', email: 'anjali@demo.com', specialization: 'ENT Specialist', qualification: 'MBBS, MS ENT', exp: 7, hosp: 'Sunrise Medical Centre', fee: 600 }
        ];

        let i = 1;
        const days = [1, 2, 3, 4, 5, 6]; // Monday to Saturday
        for (const d of doctorsData) {
            let docUser = await User.findOne({ email: d.email });
            if (!docUser) {
                const salt = await bcrypt.genSalt(10);
                docUser = await User.create({
                    name: d.name,
                    email: d.email,
                    passwordHash: await bcrypt.hash('password123', salt),
                    role: 'DOCTOR',
                    clinicId: clinics[d.hosp]._id
                });
            }

            let doctor = await Doctor.findOne({ userId: docUser._id });
            if (!doctor) {
                doctor = await Doctor.create({
                    clinicId: clinics[d.hosp]._id,
                    userId: docUser._id,
                    doctorCode: `DOC-00${i}`,
                    specialization: d.specialization,
                    qualification: d.qualification,
                    experienceYears: d.exp,
                    consultationFee: d.fee,
                    consultationDuration: 30,
                    isActive: true
                });

                // Add availability slots
                for (const day of days) {
                    await DoctorAvailability.create({
                        doctorId: doctor._id,
                        clinicId: clinics[d.hosp]._id,
                        dayOfWeek: day,
                        startTime: '10:00',
                        endTime: '13:00'
                    });
                    await DoctorAvailability.create({
                        doctorId: doctor._id,
                        clinicId: clinics[d.hosp]._id,
                        dayOfWeek: day,
                        startTime: '16:00',
                        endTime: '19:00'
                    });
                }
            }
            i++;
        }
        console.log('Doctors seeded');

        console.log('Seeding complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

runSeed();
