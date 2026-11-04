import { Router } from 'express';
import { cascadeDeleteUserData } from '../services/userCleanup.service.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

/**
 * POST /api/webhooks/clerk — Handle Clerk Webhook events (e.g. user.deleted)
 */
router.post('/clerk', async (req, res, next) => {
  try {
    const { type, data } = req.body || {};

    if (type === 'user.deleted') {
      const deletedUserId = data?.id;
      if (deletedUserId) {
        console.log(`[Webhook] Processing user.deleted for Clerk ID: ${deletedUserId}`);
        const result = await cascadeDeleteUserData(deletedUserId);
        return res.json(
          ApiResponse.success(result, 'User data cascade-deleted successfully')
        );
      }
    }

    res.json(ApiResponse.success(null, `Webhook event '${type || 'unknown'}' acknowledged`));
  } catch (error) {
    console.error('[Webhook Error] Failed to process Clerk webhook:', error);
    next(error);
  }
});

export default router;

