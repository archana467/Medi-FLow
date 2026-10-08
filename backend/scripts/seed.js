import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { ROLES } from '../src/utils/roles.js';

import User from '../src/models/user.model.js';
import Clinic from '../src/models/clinic.model.js';
import Patient from '../src/models/patient.model.js';
import Doctor from '../src/models/doctor.model.js';
import Appointment from '../src/models/appointment.model.js';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is not defined');
    
    await mongoose.connect(uri);
    console.log('Seed: Connected to MongoDB');

    // 1. Create a clinic
    const clinic = new Clinic({
      name: 'MediFlow Local Clinic',
      email: 'clinic@mediflow.local',
      phone: '1234567890'
    });
    await clinic.save();
    console.log('Created clinic:', clinic._id);

    const salt = await bcrypt.genSalt(10);
    const pass = await bcrypt.hash('password123', salt);

    // 2. Create clinic admin
    const admin = new User({
      name: 'Admin User', email: 'admin@mediflow.local', passwordHash: pass, role: ROLES.CLINIC_ADMIN, clinicId: clinic._id
    });
    await admin.save();

    // 3. Create receptionist
    const receptionist = new User({
      name: 'Recep User', email: 'receptionist@mediflow.local', passwordHash: pass, role: ROLES.RECEPTIONIST, clinicId: clinic._id
    });
    await receptionist.save();

    // 4. Create doctor
    const doctorUser = new User({
      name: 'Dr. Smith', email: 'doctor@mediflow.local', passwordHash: pass, role: ROLES.DOCTOR, clinicId: clinic._id
    });
    await doctorUser.save();

    const doctorProfile = new Doctor({
      userId: doctorUser._id, clinicId: clinic._id, specialization: 'General', licenseNumber: 'LIC-123'
    });
    await doctorProfile.save();

    // 5. Create patient
    const patientUser = new User({
      name: 'John Doe', email: 'patient@mediflow.local', passwordHash: pass, role: ROLES.PATIENT, clinicId: clinic._id
    });
    await patientUser.save();

    const patientProfile = new Patient({
      userId: patientUser._id, clinicId: clinic._id, dateOfBirth: new Date('1990-01-01'), gender: 'MALE', phone: '0987654321', address: '123 Test St'
    });
    await patientProfile.save();

    // 6. Create appointment
    const appointment = new Appointment({
      clinicId: clinic._id,
      patientId: patientProfile._id,
      doctorId: doctorProfile._id,
      startTime: new Date(Date.now() + 86400000), // tomorrow
      endTime: new Date(Date.now() + 86400000 + 3600000),
      status: 'SCHEDULED',
      reason: 'Checkup'
    });
    await appointment.save();

    console.log('Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('DEVELOPMENT CREDENTIALS:');
    console.log('All passwords are: password123');
    console.log('Admin:', admin.email);
    console.log('Doctor:', doctorUser.email);
    console.log('Receptionist:', receptionist.email);
    console.log('Patient:', patientUser.email);
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
