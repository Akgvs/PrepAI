import ApiError from '../utils/ApiError.js';

/**
 * Central error handling middleware.
 * Must be the LAST middleware registered in app.js.
 *
 * Converts all errors to a consistent JSON response format.
 * In production, stack traces are hidden.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join('. ');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = 'Resource already exists';
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid resource ID format';
  }

  // Log non-operational errors for debugging
  if (!err.isOperational) {
    console.error('Unexpected error:', err);
  }

  const response = {
    success: false,
    message,
    code,
  };

  // Include stack trace in development only
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;
