/**
 * Standardized API response wrapper.
 * Ensures all successful responses follow { success: true, data: {} } format.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response payload
   * @param {string} [message] - Optional success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.body = {
      success: true,
      message,
      data,
    };
  }

  /**
   * Send the response via Express res object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json(this.body);
  }

  // Convenience static methods
  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data,
    };
  }

  static ok(res, data, message) {
    return new ApiResponse(200, data, message).send(res);
  }

  static created(res, data, message = 'Created successfully') {
    return new ApiResponse(201, data, message).send(res);
  }
}

export default ApiResponse;
