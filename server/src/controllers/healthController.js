import mongoose from 'mongoose';
import { successResponse } from '../utils/responseFormatter.js';
import { config } from '../config/environment.js';

export const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  return successResponse(res, {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.env,
    database: dbStatus,
  }, 'SMRUTI backend is running');
};
