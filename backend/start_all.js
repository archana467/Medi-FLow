import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function start() {
  console.log('Starting MongoDB Memory Server...');
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  console.log(`MongoDB started at ${mongoUri}`);

  // write .env
  const envContent = `PORT=5000
MONGODB_URI=${mongoUri}
FRONTEND_URL=http://localhost:5173
JWT_ACCESS_SECRET=super_secret
JWT_REFRESH_SECRET=super_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=test
SMTP_PASSWORD=test
SMTP_FROM=noreply@mediflow.local
SUPER_ADMIN_NAME=Super Administrator
SUPER_ADMIN_EMAIL=superadmin@mediflow.com
SUPER_ADMIN_PASSWORD=change_this_in_production
`;
  fs.writeFileSync('./.env', envContent);

  console.log('Bootstrapping...');
  const bs = spawn('node', ['scripts/bootstrap.js'], { stdio: 'inherit', shell: true });
  await new Promise(r => bs.on('close', r));

  console.log('Seeding...');
  const sd = spawn('node', ['scripts/seed.js'], { stdio: 'inherit', shell: true });
  await new Promise(r => sd.on('close', r));

  console.log('Starting Backend...');
  const backend = spawn('node', ['src/server.js'], { stdio: 'inherit', shell: true });

  console.log('Skipping Worker to prevent BullMQ ioredis-mock crash...');
  // const worker = spawn('node', ['src/worker.js'], { stdio: 'inherit', shell: true });

  console.log('Starting Frontend...');
  const frontendEnv = { ...process.env, VITE_API_URL: 'http://localhost:5000/api' };
  const frontend = spawn('npm', ['run', 'dev'], { cwd: '../frontend', stdio: 'inherit', env: frontendEnv, shell: true });

  console.log('\n\n==========================================');
  console.log('ALL SERVICES STARTED.');
  console.log('Main Localhost URL: http://localhost:5173');
  console.log('Backend Health URL: http://localhost:5000/api/health');
  console.log('==========================================\n\n');
}

start().catch(console.error);
