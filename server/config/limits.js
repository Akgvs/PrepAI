/**
 * Usage limits per plan for AI Mock Interviews.
 * Two tiers:
 * - 'free': 5 free mock interviews.
 * - 'paid': Unlimited mock interviews (Infinity).
 */
const PLAN_LIMITS = {
  free: {
    interviewsGenerated: 5,
    answersEvaluated: 50,
    resumesCreated: 3,
  },
  paid: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
  },
  monthly: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
  },
  yearly: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
  },
};

export default PLAN_LIMITS;

