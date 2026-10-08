import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

export const createUser = async (data) => {
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    const error = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const user = new User({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role,
    clinicId: data.clinicId || null
  });

  await user.save();
  return user;
};

export const getUsers = async (filter = {}) => {
  return await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
};

export const getUserById = async (userId) => {
  return await User.findById(userId).select('-passwordHash');
};

export const updateUserRole = async (userId, role) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.role = role;
  await user.save();
  return user;
};

export const updateUserStatus = async (userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = isActive;
  await user.save();
  return user;
};
