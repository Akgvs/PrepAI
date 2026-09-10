import { Router } from 'express';
import ensureUser, { requireAuthOrDemo } from '../middleware/auth.middleware.js';
import checkUsageLimit from '../middleware/usageLimit.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createInterviewSchema,
  submitAnswerSchema,
} from '../utils/validators.js';
import {
  createInterview,
  getUserInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
  deleteInterview,
} from '../controllers/interview.controller.js';

const router = Router();

router.use(requireAuthOrDemo);
router.use(ensureUser);

router.post(
  '/',
  checkUsageLimit('interviews'),
  validate(createInterviewSchema),
  createInterview
);

router.get('/', getUserInterviews);
router.get('/:id', getInterviewById);
router.delete('/:id', deleteInterview);

router.post(
  '/:id/answers',
  checkUsageLimit('answersEvaluated'),
  validate(submitAnswerSchema),
  submitAnswer
);

router.post('/:id/complete', completeInterview);

export default router;
