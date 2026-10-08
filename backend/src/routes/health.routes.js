import express from 'express';
import mongoose from 'mongoose';
import { getRedisStatus } from '../config/redis.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  let dbStatus = 'disconnected';
  
  if (dbState === 1) {
    dbStatus = 'connected';
  } else if (dbState === 2) {
    dbStatus = 'connecting';
  } else if (dbState === 3) {
    dbStatus = 'disconnecting';
  }
  
  const redisStatus = getRedisStatus();
  const isHealthy = dbStatus === 'connected' && redisStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy ? 'MediFlow API is running' : 'MediFlow API is running with degraded services',
    database: dbStatus,
    redis: redisStatus
  });
});

export default router;
