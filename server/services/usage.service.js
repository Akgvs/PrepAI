import Usage from '../models/Usage.model.js';
import PLAN_LIMITS from '../config/limits.js';
import ApiError from '../utils/ApiError.js';

const FIELD_MAP = {
  interviews: 'interviewsGenerated',
  interviewsGenerated: 'interviewsGenerated',
  answers: 'answersEvaluated',
  answersEvaluated: 'answersEvaluated',
  resumes: 'resumesCreated',
  resumesCreated: 'resumesCreated',
};

export const normalizeUsageField = (field) => {
  const normalized = FIELD_MAP[field];
  if (!normalized) {
    throw ApiError.internal(`Unknown usage field: ${field}`);
  }
  return normalized;
};

export const getCurrentDatePeriod = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
};

/**
 * Get or create current month usage document
 */
export const getOrCreateMonthlyUsage = async (clerkUserId) => {
  const { month, year } = getCurrentDatePeriod();

  let usageDoc = await Usage.findOne({ clerkUserId, month, year });
  if (!usageDoc) {
    usageDoc = await Usage.create({ clerkUserId, month, year });
  }
  return usageDoc;
};

/**
 * Check if the user has remaining quota for an action
 */
export const checkQuota = async (clerkUserId, plan = 'free', field) => {
  const normalizedField = normalizeUsageField(field);
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const maxLimit = limits[normalizedField];

  const usageDoc = await getOrCreateMonthlyUsage(clerkUserId);
  const currentUsage = usageDoc[normalizedField] || 0;

  // Paid tier or Infinity limit = unlimited
  const isUnlimited = plan === 'paid' || maxLimit === Infinity || maxLimit === null;
  if (isUnlimited) {
    return {
      allowed: true,
      currentUsage,
      maxLimit: Infinity,
      remaining: Infinity,
      isUnlimited: true,
      usageDoc,
      normalizedField,
    };
  }

  if (maxLimit === undefined) {
    throw ApiError.internal(`No limit configured for field: ${normalizedField}`);
  }

  if (currentUsage >= maxLimit) {
    throw ApiError.tooMany(
      `Free plan limit reached: you have used all ${maxLimit} free mock interviews. Please upgrade to the Paid plan for unlimited practice sessions.`
    );
  }

  return {
    allowed: true,
    currentUsage,
    maxLimit,
    remaining: Math.max(0, maxLimit - currentUsage),
    isUnlimited: false,
    usageDoc,
    normalizedField,
  };
};

/**
 * Atomically increment quota for an action
 */
export const incrementQuota = async (clerkUserId, field) => {
  const normalizedField = normalizeUsageField(field);
  const { month, year } = getCurrentDatePeriod();

  const updatedUsage = await Usage.findOneAndUpdate(
    { clerkUserId, month, year },
    { $inc: { [normalizedField]: 1 } },
    { new: true, upsert: true }
  );

  return updatedUsage;
};

/**
 * Get user usage summary for the current month
 */
export const getUserUsageSummary = async (clerkUserId, plan = 'free') => {
  const { month, year } = getCurrentDatePeriod();
  const usageDoc = await getOrCreateMonthlyUsage(clerkUserId);
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free;

  const interviewsLimit = limits.interviewsGenerated === Infinity ? null : limits.interviewsGenerated;
  const answersLimit = limits.answersEvaluated === Infinity ? null : limits.answersEvaluated;
  const resumesLimit = limits.resumesCreated === Infinity ? null : limits.resumesCreated;
  const isUnlimited = plan === 'paid' || limits.interviewsGenerated === Infinity;

  return {
    plan,
    isUnlimited,
    limits: {
      interviewsGenerated: interviewsLimit,
      answersEvaluated: answersLimit,
      resumesCreated: resumesLimit,
    },
    usage: {
      interviewsGenerated: usageDoc.interviewsGenerated || 0,
      answersEvaluated: usageDoc.answersEvaluated || 0,
      resumesCreated: usageDoc.resumesCreated || 0,
    },
    remaining: {
      interviewsGenerated: isUnlimited
        ? null
        : Math.max(0, (interviewsLimit || 5) - (usageDoc.interviewsGenerated || 0)),
      answersEvaluated: isUnlimited
        ? null
        : Math.max(0, (answersLimit || 50) - (usageDoc.answersEvaluated || 0)),
      resumesCreated: isUnlimited
        ? null
        : Math.max(0, (resumesLimit || 3) - (usageDoc.resumesCreated || 0)),
    },
    month,
    year,
  };
};

export default {
  normalizeUsageField,
  getOrCreateMonthlyUsage,
  checkQuota,
  incrementQuota,
  getUserUsageSummary,
};
