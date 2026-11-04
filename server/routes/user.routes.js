import { Router } from 'express';
import ensureUser, { requireAuthOrDemo } from '../middleware/auth.middleware.js';
import { cascadeDeleteUserData } from '../services/userCleanup.service.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.use(requireAuthOrDemo);
router.use(ensureUser);

/**
 * DELETE /api/users/me — GDPR self-service deletion: permanently purge account and all assets
 */
router.delete('/me', async (req, res, next) => {
  try {
    const clerkUserId = req.auth.userId;
    const result = await cascadeDeleteUserData(clerkUserId);
    res.json(
      ApiResponse.success(
        result,
        'Account and all associated quizzes, interviews, resumes, and metrics permanently deleted.'
      )
    );
  } catch (error) {
    next(error);
  }
});

export default router;

