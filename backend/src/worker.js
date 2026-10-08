import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

// Load workers
import './workers/notification.worker.js';
import './workers/email.worker.js';
import './workers/reminder.worker.js';

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Worker connected to MongoDB');
    console.log('BullMQ Workers started successfully.');
  })
  .catch((err) => {
    console.error('Worker MongoDB connection error', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await mongoose.connection.close();
    process.exit(0);
});