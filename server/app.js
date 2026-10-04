import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';

import { generalLimiter } from './middleware/rateLimiter.middleware.js';
import errorHandler from './middleware/errorHandler.middleware.js';

// Route imports for AI Mock Interview, Resumes & Usage
import interviewRoutes from './routes/interview.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import usageRoutes from './routes/usage.routes.js';

const app = express();

// ----------------------------
// Global Middleware
// ----------------------------

// Security headers
app.use(helmet());

// CORS — allow only the frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiting
app.use(generalLimiter);

// Clerk middleware — makes req.auth available on all routes when configured
const hasClerkKeys = Boolean(
  process.env.CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY &&
    !process.env.CLERK_PUBLISHABLE_KEY.includes('...') &&
    process.env.CLERK_PUBLISHABLE_KEY.startsWith('pk_') &&
    process.env.CLERK_SECRET_KEY.startsWith('sk_')
);

if (hasClerkKeys) {
  app.use(clerkMiddleware());
} else {
  app.use((req, res, next) => {
    req.auth = req.auth || {
      userId: 'demo_user_001',
      sessionClaims: {
        email: 'candidate@demo.com',
        name: 'Demo Candidate',
      },
    };
    next();
  });
}

// ----------------------------
// API Routes
// ----------------------------

app.use('/api/interviews', interviewRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/usage', usageRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PrepAI API is running',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------
// 404 Handler
// ----------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// ----------------------------
// Error Handler (must be last)
// ----------------------------

app.use(errorHandler);

export default app;
