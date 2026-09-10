import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';
import { requireAuth } from '@clerk/express';

/**
 * Authentication check that supports both live Clerk and safe Development Demo Mode.
 */
/**
 * Authentication check that supports both live Clerk and safe Development Demo Mode.
 */
export const requireAuthOrDemo = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If a Bearer token is provided and Clerk is configured, authenticate via Clerk
  const hasClerkSecret = Boolean(
    process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes('...') &&
      process.env.CLERK_SECRET_KEY.startsWith('sk_')
  );

  if (hasClerkSecret && authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth()(req, res, (err) => {
      if (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Clerk auth failed, falling back to demo user:', err.message);
          req.auth = {
            userId: 'demo_user_001',
            sessionClaims: {
              email: 'candidate@demo.com',
              name: 'Demo Candidate',
            },
          };
          return next();
        }
        return next(err);
      }
      next();
    });
  }

  // If no auth token provided and in development/demo mode
  if (process.env.NODE_ENV !== 'production' || !hasClerkSecret) {
    req.auth = {
      userId: 'demo_user_001',
      sessionClaims: {
        email: 'candidate@demo.com',
        name: 'Demo Candidate',
      },
    };
    return next();
  }

  // In production with Clerk configured
  return requireAuth()(req, res, next);
};

/**
 * Middleware that ensures a User document exists in MongoDB for the
 * authenticated user. Uses JIT (Just-In-Time) creation.
 */
const ensureUser = async (req, res, next) => {
  try {
    let clerkUserId = req.auth?.userId;

    if (!clerkUserId) {
      if (
        !process.env.CLERK_SECRET_KEY ||
        process.env.CLERK_SECRET_KEY.includes('...')
      ) {
        clerkUserId = 'demo_user_001';
        req.auth = {
          userId: clerkUserId,
          sessionClaims: {
            email: 'candidate@demo.com',
            name: 'Demo Candidate',
          },
        };
      } else {
        return next(ApiError.unauthorized());
      }
    }

    // Check if user already exists in DB
    let user = await User.findOne({ clerkUserId });

    if (!user) {
      const sessionClaims = req.auth?.sessionClaims || {};

      user = await User.create({
        clerkUserId,
        email: sessionClaims.email || 'candidate@demo.com',
        name: sessionClaims.name || sessionClaims.firstName || 'Demo Candidate',
        imageUrl: sessionClaims.imageUrl || '',
        plan: 'free',
      });
    }

    req.user = user;
    req.dbUser = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default ensureUser;
