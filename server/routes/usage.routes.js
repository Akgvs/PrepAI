import { Router } from 'express';
import ensureUser, { requireAuthOrDemo } from '../middleware/auth.middleware.js';
import { getUserUsageSummary } from '../services/usage.service.js';
import User from '../models/User.model.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const router = Router();

router.use(requireAuthOrDemo);
router.use(ensureUser);

/**
 * GET /api/usage
 * Returns the current month's usage and the user's plan limits.
 */
router.get('/', async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    const user = await User.findOne({ clerkUserId });
    const plan = user?.plan || req.user?.plan || 'free';

    const summary = await getUserUsageSummary(clerkUserId, plan);
    res.json(ApiResponse.success(summary));
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/usage/plan
 * Switch or upgrade user plan ('free' or 'paid')
 */
router.post('/plan', async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    const { plan } = req.body;

    if (!['free', 'paid'].includes(plan)) {
      throw ApiError.badRequest('Invalid plan. Allowed values: free, paid');
    }

    const updatedUser = await User.findOneAndUpdate(
      { clerkUserId },
      { plan },
      { new: true, upsert: true }
    );

    const summary = await getUserUsageSummary(clerkUserId, plan);

    res.json(
      ApiResponse.success(
        { user: updatedUser, summary },
        `Plan successfully switched to ${plan}`
      )
    );
  } catch (error) {
    next(error);
  }
});

export default router;

