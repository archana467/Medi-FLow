import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';
import { ROLES } from '../src/utils/roles.js';

dotenv.config();

const bootstrapSuperAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI is not defined.');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@mediflow.com';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
    const adminName = process.env.SUPER_ADMIN_NAME || 'Super Administrator';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`SUPER_ADMIN with email ${adminEmail} already exists.`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const superAdmin = new User({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: ROLES.SUPER_ADMIN,
      clinicId: null
    });

    await superAdmin.save();
    console.log(`Successfully created SUPER_ADMIN: ${adminEmail}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to bootstrap SUPER_ADMIN:', error);
    process.exit(1);
  }
};

bootstrapSuperAdmin();
