import { Router } from 'express';
import ensureUser, { requireAuthOrDemo } from '../middleware/auth.middleware.js';
import checkUsageLimit from '../middleware/usageLimit.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { createQuizSchema, submitQuizSchema } from '../utils/validators.js';
import {
  createQuiz,
  getUserQuizzes,
  getQuizById,
  submitQuiz,
  deleteQuiz,
  archiveOldQuizzes,
} from '../controllers/quiz.controller.js';

const router = Router();

// Require authentication & database user record
router.use(requireAuthOrDemo);
router.use(ensureUser);

// Quiz endpoints
router.post(
  '/',
  checkUsageLimit('quizzesGenerated'),
  validate(createQuizSchema),
  createQuiz
);

router.get('/', getUserQuizzes);
router.post('/maintenance/archive-old', archiveOldQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', validate(submitQuizSchema), submitQuiz);
router.delete('/:id', deleteQuiz);

export default router;
