import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all routes.
 * 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Stricter rate limiter for AI endpoints.
 * 20 requests per 15 minutes per IP.
 */
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please slow down.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
