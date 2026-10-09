import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Clinic from '../models/clinic.model.js';
import Doctor from '../models/doctor.model.js';

const DEMO_DOCTORS = [
  {
    name: 'Dr. Aarav Sharma',
    specialization: 'Cardiologist',
    qualification: 'MBBS, MD Cardiology',
    hospital: 'MediFlow City Clinic',
    experience: 12,
    fee: 1000,
  },
  {
    name: 'Dr. Priya Patel',
    specialization: 'Dermatologist',
    qualification: 'MBBS, MD Dermatology',
    hospital: 'MediFlow Skin & Wellness Center',
    experience: 8,
    fee: 800,
  },
  {
    name: 'Dr. Rohan Mehta',
    specialization: 'Orthopedic',
    qualification: 'MBBS, MS Orthopedics',
    hospital: 'MediFlow Orthopedic Center',
    experience: 10,
    fee: 1200,
  },
  {
    name: 'Dr. Ananya Shah',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    hospital: 'MediFlow General Clinic',
    experience: 7,
    fee: 500,
  },
  {
    name: 'Dr. Neha Verma',
    specialization: 'Pediatrician',
    qualification: 'MBBS, MD Pediatrics',
    hospital: 'MediFlow Children\'s Clinic',
    experience: 9,
    fee: 700,
  },
  {
    name: 'Dr. Vikram Singh',
    specialization: 'Neurologist',
    qualification: 'MBBS, MD Neurology',
    hospital: 'MediFlow Neuro Care',
    experience: 15,
    fee: 1500,
  },
  {
    name: 'Dr. Sneha Desai',
    specialization: 'Gynecologist',
    qualification: 'MBBS, MS Gynecology',
    hospital: 'MediFlow Women\'s Health',
    experience: 11,
    fee: 900,
  },
  {
    name: 'Dr. Arjun Reddy',
    specialization: 'ENT Specialist',
    qualification: 'MBBS, MS ENT',
    hospital: 'MediFlow ENT Center',
    experience: 6,
    fee: 600,
  },
  {
    name: 'Dr. Kavita Joshi',
    specialization: 'Psychiatrist',
    qualification: 'MBBS, MD Psychiatry',
    hospital: 'MediFlow Mental Health Center',
    experience: 14,
    fee: 1100,
  },
  {
    name: 'Dr. Rahul Kumar',
    specialization: 'Ophthalmologist',
    qualification: 'MBBS, MS Ophthalmology',
    hospital: 'MediFlow Eye Care',
    experience: 10,
    fee: 800,
  },
  {
    name: 'Dr. Sanya Kapoor',
    specialization: 'Dentist',
    qualification: 'BDS, MDS',
    hospital: 'MediFlow Dental Clinic',
    experience: 5,
    fee: 400,
  }
];

export const seedDoctors = async () => {
  try {
    const doctorCount = await Doctor.countDocuments();
    if (doctorCount > 0) {
      console.log(`[Seed] Found ${doctorCount} doctors. Skipping seed.`);
      return;
    }

    console.log('[Seed] Seeding demo doctors...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    for (let i = 0; i < DEMO_DOCTORS.length; i++) {
      const d = DEMO_DOCTORS[i];
      
      // Get or create clinic
      let clinic = await Clinic.findOne({ name: d.hospital });
      if (!clinic) {
        clinic = await Clinic.create({
          name: d.hospital,
          email: `contact@${d.hospital.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: '1234567890',
          address: 'Main St, Metro, State 12345',
          isActive: true
        });
      }

      // Create user for doctor
      const email = d.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '@mediflow.com';
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: d.name,
          email: email,
          passwordHash: hashedPassword,
          role: 'DOCTOR',
          clinicId: clinic._id,
          isActive: true
        });
      }

      // Create doctor
      await Doctor.create({
        clinicId: clinic._id,
        userId: user._id,
        doctorCode: `DOC-${1000 + i}`,
        specialization: d.specialization,
        qualification: d.qualification,
        experienceYears: d.experience,
        consultationFee: d.fee,
        bio: `${d.name} is a highly experienced ${d.specialization} at ${d.hospital}.`,
        isActive: true
      });
    }
    console.log('[Seed] Successfully seeded demo doctors.');
  } catch (error) {
    console.error('[Seed] Error seeding doctors:', error);
  }
};
