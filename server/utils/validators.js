import Joi from 'joi';

/**
 * Validation schemas for Interview endpoints
 */
export const createInterviewSchema = Joi.object({
  jobRole: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Job role is required',
    'string.min': 'Job role must be at least 2 characters',
    'string.max': 'Job role cannot exceed 100 characters',
  }),
  jobDescription: Joi.string().trim().min(10).max(3000).required().messages({
    'string.empty': 'Job description is required',
    'string.min': 'Job description must be at least 10 characters',
    'string.max': 'Job description cannot exceed 3000 characters',
  }),
  experienceLevel: Joi.string()
    .valid('fresher', '1-2 years', '3-5 years', '5+ years')
    .default('fresher'),
  techStack: Joi.string().trim().allow('').max(500).default(''),
  interviewType: Joi.string()
    .valid('technical', 'behavioral', 'hr', 'mixed')
    .default('technical'),
  difficulty: Joi.string()
    .valid('easy', 'medium', 'hard')
    .default('medium'),
  numberOfQuestions: Joi.number().integer().min(1).max(10).default(5),
});

export const submitAnswerSchema = Joi.object({
  questionId: Joi.string().hex().length(24).required().messages({
    'string.empty': 'Question ID is required',
    'string.length': 'Invalid Question ID format',
  }),
  answer: Joi.string().trim().min(2).max(5000).required().messages({
    'string.empty': 'Answer is required',
    'string.min': 'Answer must be at least 2 characters',
  }),
});
