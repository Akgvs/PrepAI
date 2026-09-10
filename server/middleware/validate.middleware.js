import ApiError from '../utils/ApiError.js';

/**
 * Factory function that creates a validation middleware for a given Joi schema.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @returns {import('express').RequestHandler}
 *
 * Usage in routes:
 *   import validate from '../middleware/validate.middleware.js';
 *   import { createInterviewSchema } from '../validators/interview.validator.js';
 *   router.post('/', validate(createInterviewSchema), controller.create);
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,      // Report all errors, not just the first
      stripUnknown: true,      // Remove unknown fields (mass assignment protection)
      allowUnknown: false,     // Don't allow unknown fields
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      return next(ApiError.badRequest(messages, 'VALIDATION_ERROR'));
    }

    // Replace req.body with validated + sanitized data
    req.body = value;
    next();
  };
};

export default validate;
