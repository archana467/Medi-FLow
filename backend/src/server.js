import express from 'express';
import http from 'http';
import { initSocket } from './socket/socket.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

// Always start HTTP server first
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to database (non-blocking — health endpoint reports status)
connectDB();
