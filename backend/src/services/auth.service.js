import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';

// Convert refresh string like "7d" to MS for expiresAt
const getExpirationDate = (expiresIn) => {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback 7d
  const value = parseInt(match[1]);
  const unit = match[2];
  let ms = 0;
  if (unit === 'd') ms = value * 24 * 60 * 60 * 1000;
  else if (unit === 'h') ms = value * 60 * 60 * 1000;
  else if (unit === 'm') ms = value * 60 * 1000;
  else if (unit === 's') ms = value * 1000;
  
  return new Date(Date.now() + ms);
};

export const registerUser = async (data) => {
  const { name, email, password, role } = data;
  
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // We should assign them to a default clinic if one exists
  const Clinic = await import('../models/clinic.model.js').then(m => m.default);
  const defaultClinic = await Clinic.findOne({});
  const clinicId = defaultClinic ? defaultClinic._id : null;

  const user = new User({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: role || 'PATIENT',
    clinicId
  });

  await user.save();

  // Create corresponding role record
  if (clinicId) {
    if (user.role === 'PATIENT') {
      const Patient = await import('../models/patient.model.js').then(m => m.default);
      await Patient.create({
        clinicId,
        userId: user._id,
        patientId: `PAT-${Date.now()}`,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || 'Unknown',
        dateOfBirth: new Date(),
        gender: 'Other',
        phone: '0000000000',
        email: email.toLowerCase()
      });
    } else if (user.role === 'DOCTOR') {
      const Doctor = await import('../models/doctor.model.js').then(m => m.default);
      await Doctor.create({
        clinicId,
        userId: user._id,
        doctorCode: `DOC-${Date.now()}`,
        specialization: 'General',
      });
    }
    } else if (user.role === 'STAFF') {
      try {
        const Staff = await import('../models/staff.model.js').then(m => m.default);
        if (Staff) {
          await Staff.create({
            clinicId,
            userId: user._id,
            staffId: `STF-${Date.now()}`,
            department: 'General'
          });
        }
      } catch (e) {
        // Staff model might not exist
      }
    }

  return await createAuthSession(user);
};

export const loginUser = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is inactive');
    error.statusCode = 403;
    throw error;
  }

  return await createAuthSession(user);
};

export const refreshSession = async (tokenStr) => {
  if (!tokenStr) {
    const error = new Error('No refresh token provided');
    error.statusCode = 401;
    throw error;
  }

  const decoded = verifyRefreshToken(tokenStr);
  if (!decoded || !decoded.userId) {
    const error = new Error('Invalid or expired refresh token');
    error.statusCode = 401;
    throw error;
  }

  const tokenHash = crypto.createHash('sha256').update(tokenStr).digest('hex');

  // Verify the stored refresh token exists and matches
  const storedToken = await RefreshToken.findOne({
    userId: decoded.userId,
    tokenHash
  });

  if (!storedToken) {
    const error = new Error('Invalid refresh token session');
    error.statusCode = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    await RefreshToken.findByIdAndDelete(storedToken._id);
    const error = new Error('User inactive or not found');
    error.statusCode = 403;
    throw error;
  }

  // Delete the old refresh token (rotation)
  await RefreshToken.findByIdAndDelete(storedToken._id);

  return await createAuthSession(user);
};

export const logoutUser = async (tokenStr) => {
  if (!tokenStr) return;
  const tokenHash = crypto.createHash('sha256').update(tokenStr).digest('hex');
  await RefreshToken.deleteOne({ tokenHash });
};

export const getUserById = async (userId) => {
  return await User.findById(userId).select('-passwordHash');
};

const createAuthSession = async (user) => {
  const payload = { 
    userId: user._id,
    role: user.role
  };
  
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Store a hash of the refresh token in the database
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: getExpirationDate(expiresIn)
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};
