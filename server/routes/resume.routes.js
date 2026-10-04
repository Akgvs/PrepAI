import { Router } from 'express';
import ensureUser, { requireAuthOrDemo } from '../middleware/auth.middleware.js';
import checkUsageLimit from '../middleware/usageLimit.middleware.js';
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResume,
  deleteResume,
  scoreResume,
  rewriteBullet,
} from '../controllers/resume.controller.js';

const router = Router();

// Apply auth middleware to all resume routes
router.use(requireAuthOrDemo);
router.use(ensureUser);

// Routes
router.post('/', checkUsageLimit('resumesCreated'), createResume);
router.get('/', getUserResumes);
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// AI features
router.post('/:id/score', scoreResume);
router.post('/:id/rewrite-bullet', rewriteBullet);

export default router;
