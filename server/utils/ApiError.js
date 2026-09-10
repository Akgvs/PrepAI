/**
 * Custom API error class.
 * Extends Error with HTTP status code and error code for structured responses.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Human-readable error message
   * @param {string} [code] - Machine-readable error code (e.g., 'USAGE_LIMIT_EXCEEDED')
   */
  constructor(statusCode, message, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // distinguishes known errors from unexpected crashes

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, code = 'BAD_REQUEST') {
    return new ApiError(400, message, code);
  }

  static unauthorized(message = 'Authentication required', code = 'UNAUTHORIZED') {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'Access denied', code = 'FORBIDDEN') {
    return new ApiError(403, message, code);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND') {
    return new ApiError(404, message, code);
  }

  static conflict(message, code = 'CONFLICT') {
    return new ApiError(409, message, code);
  }

  static tooMany(message = 'Monthly AI usage limit reached.', code = 'USAGE_LIMIT_EXCEEDED') {
    return new ApiError(429, message, code);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR') {
    return new ApiError(500, message, code);
  }

  static aiFailure(message = 'AI service unavailable. Please try again.', code = 'AI_SERVICE_ERROR') {
    return new ApiError(502, message, code);
  }
}

export default ApiError;
