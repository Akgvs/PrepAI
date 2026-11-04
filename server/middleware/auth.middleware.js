import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

const attachDemoAuth = (req, clerkUserId = 'demo_user_001') => {
  const demoData = {
    userId: clerkUserId,
    sessionClaims: {
      email: 'candidate@demo.com',
      name: 'Demo Candidate',
    },
  };
  req.auth = Object.assign(() => demoData, demoData);
};

/**
 * Authentication check that supports both live Clerk and safe Development Demo Mode.
 */
export const requireAuthOrDemo = (req, res, next) => {
  const userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

  // 1. Authenticated user from Clerk
  if (userId) {
    return next();
  }

  // 2. Safe development / demo mode fallback
  const hasClerkSecret = Boolean(
    process.env.CLERK_SECRET_KEY &&
      !process.env.CLERK_SECRET_KEY.includes('...') &&
      process.env.CLERK_SECRET_KEY.startsWith('sk_')
  );

  if (process.env.NODE_ENV !== 'production' || !hasClerkSecret) {
    attachDemoAuth(req);
    return next();
  }

  // 3. Unauthenticated in production
  return next(ApiError.unauthorized('Authentication required'));
};

/**
 * Middleware that ensures a User document exists in MongoDB for the
 * authenticated user. Uses JIT (Just-In-Time) creation.
 */
const ensureUser = async (req, res, next) => {
  try {
    let clerkUserId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId;

    if (!clerkUserId) {
      if (
        !process.env.CLERK_SECRET_KEY ||
        process.env.CLERK_SECRET_KEY.includes('...') ||
        process.env.NODE_ENV !== 'production'
      ) {
        clerkUserId = 'demo_user_001';
        attachDemoAuth(req, clerkUserId);
      } else {
        return next(ApiError.unauthorized('Authentication required'));
      }
    }

    // Check if user already exists in DB
    let user = await User.findOne({ clerkUserId });

    if (!user) {
      const authObj = typeof req.auth === 'function' ? req.auth() : (req.auth || {});
      const sessionClaims = authObj.sessionClaims || {};

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
