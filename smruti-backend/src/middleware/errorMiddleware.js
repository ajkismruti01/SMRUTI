import { errorResponse } from '../utils/responseFormatter.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`[Unhandled Error] ${err.message}`, err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, 'Database validation failed.', 400, errors, 'VALIDATION_ERROR');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return errorResponse(res, `Duplicate entry for field: ${field}`, 400, [], 'DUPLICATE_KEY_ERROR');
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid format for field: ${err.path}`, 400, [], 'CAST_ERROR');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    return errorResponse(res, `File upload error: ${err.message}`, 400, [], 'UPLOAD_ERROR');
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'An unexpected error occurred. Please try again later.'
    : err.message || 'Server error';

  return errorResponse(res, message, statusCode, [], err.code || 'INTERNAL_SERVER_ERROR');
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `API route not found: ${req.method} ${req.originalUrl}`, 404, [], 'ROUTE_NOT_FOUND');
};
