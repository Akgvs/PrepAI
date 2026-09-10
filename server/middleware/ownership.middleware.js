import ApiError from '../utils/ApiError.js';

/**
 * Generic resource ownership middleware.
 * Verifies that a MongoDB document belongs to the authenticated user.
 *
 * @param {import('mongoose').Model} Model - Mongoose model to query
 * @param {string} [paramName='id'] - Route parameter name for the resource ID
 * @returns {import('express').RequestHandler}
 *
 * Usage:
 *   router.get('/:id', requireAuth(), ensureUser, checkOwnership(Interview), controller.getOne);
 *
 * Attaches the found document to req.resource for downstream use.
 */
const checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const clerkUserId = req.auth?.userId;
      const resourceId = req.params[paramName];

      if (!resourceId) {
        return next(ApiError.badRequest('Resource ID is required'));
      }

      const resource = await Model.findOne({
        _id: resourceId,
        clerkUserId,
      });

      if (!resource) {
        return next(ApiError.notFound('Resource not found'));
      }

      // Attach for downstream use — avoids a duplicate DB query in the controller
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkOwnership;
