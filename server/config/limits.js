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
    quizzesGenerated: 5,
  },
  paid: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
    quizzesGenerated: Infinity,
  },
  monthly: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
    quizzesGenerated: Infinity,
  },
  yearly: {
    interviewsGenerated: Infinity,
    answersEvaluated: Infinity,
    resumesCreated: Infinity,
    quizzesGenerated: Infinity,
  },
};

export default PLAN_LIMITS;

