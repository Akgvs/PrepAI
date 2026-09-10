import { checkQuota, incrementQuota } from '../services/usage.service.js';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware factory to check user's plan quota for a feature before allowing execution.
 * Follows Single Responsibility and delegates data logic to usage.service.js.
 *
 * @param {string} usageField - Usage identifier (e.g. 'interviews', 'interviewsGenerated', etc.)
 * @returns {import('express').RequestHandler}
 */
const checkUsageLimit = (usageField) => {
  return async (req, res, next) => {
    try {
      const clerkUserId = req.auth?.userId;
      const user = req.user || req.dbUser;

      if (!clerkUserId || !user) {
        return next(
          ApiError.internal('User not loaded. Ensure ensureUser middleware runs first.')
        );
      }

      const plan = user.plan || 'free';
      const quotaStatus = await checkQuota(clerkUserId, plan, usageField);

      // Attach to request for downstream reference
      req.usageQuota = quotaStatus;
      req.usageField = quotaStatus.normalizedField;

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { incrementQuota };
export default checkUsageLimit;
