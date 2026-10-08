import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(redisUrl);

connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export const getRedisStatus = () => {
  return connection.status === 'ready' ? 'connected' : 'disconnected';
};

export default connection;