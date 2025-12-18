import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

const notFound = (req, res, next) => {
  const error = new ApiError(404, 'Resource not found');
  next(error);
};

const handleError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Only show stack trace in development
  const isDevelopment = env.NODE_ENV === 'development';
  
  const errorResponse = {
    status: 'error',
    statusCode,
    message
  };

  // Log full error on server (always)
  if (statusCode >= 500) {
    console.error('Server Error:', {
      statusCode,
      message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  } else if (isDevelopment) {
    // Log client errors only in development
    console.log('Client Error:', {
      statusCode,
      message,
      path: req.path,
      method: req.method
    });
  }

  res.status(statusCode).json(errorResponse);
};

export default {
  notFound,
  handleError
};