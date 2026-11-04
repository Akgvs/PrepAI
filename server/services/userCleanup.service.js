import Quiz from '../models/Quiz.model.js';
import Interview from '../models/Interview.model.js';
import Resume from '../models/Resume.model.js';
import Usage from '../models/Usage.model.js';
import User from '../models/User.model.js';

/**
 * Scenario 1: Auto-submit and grade stale in-progress quizzes that exceeded their time limits.
 *
 * @param {number} gracePeriodMinutes - Grace period beyond the time limit (default 10 mins)
 * @returns {Promise<number>} Number of quizzes auto-submitted
 */
export const autoSubmitStaleQuizzes = async (gracePeriodMinutes = 10) => {
  const staleCandidates = await Quiz.find({
    status: 'in-progress',
  });

  let autoSubmittedCount = 0;
  const now = Date.now();

  for (const quiz of staleCandidates) {
    const timeLimitMs = (quiz.timeLimitMinutes || 10) * 60 * 1000;
    const graceMs = gracePeriodMinutes * 60 * 1000;
    const createdAtMs = new Date(quiz.createdAt).getTime();

    if (now - createdAtMs > timeLimitMs + graceMs) {
      let correctCount = 0;
      quiz.questions.forEach((q) => {
        const hasValidAnswer =
          q.userAnswer !== null &&
          q.userAnswer !== undefined &&
          Number.isInteger(Number(q.userAnswer));

        q.isCorrect = hasValidAnswer && Number(q.userAnswer) === q.correctAnswer;
        if (q.isCorrect) correctCount += 1;
      });

      const totalQuestions = quiz.questions.length || 1;
      const percentage = Math.round((correctCount / totalQuestions) * 100);

      quiz.score = correctCount;
      quiz.percentage = percentage;
      quiz.passed = percentage >= 60;
      quiz.performanceSummary =
        'Assessment auto-finalized after the allotted test duration elapsed.';
      quiz.status = 'completed';
      quiz.completedAt = new Date();
      quiz.expireAt = null; // Clear TTL index now that it's completed

      await quiz.save();
      autoSubmittedCount += 1;
    }
  }

  return autoSubmittedCount;
};

/**
 * Scenario 2: Cascade delete all user records upon account deletion (GDPR compliance).
 *
 * @param {string} clerkUserId - The Clerk user identifier
 * @returns {Promise<object>} Summary of deleted records
 */
export const cascadeDeleteUserData = async (clerkUserId) => {
  if (!clerkUserId) {
    throw new Error('clerkUserId is required for cascade deletion');
  }

  const [quizzes, interviews, resumes, usage, user] = await Promise.all([
    Quiz.deleteMany({ clerkUserId }),
    Interview.deleteMany({ clerkUserId }),
    Resume.deleteMany({ clerkUserId }),
    Usage.deleteMany({ clerkUserId }),
    User.deleteOne({ clerkUserId }),
  ]);

  return {
    clerkUserId,
    deletedQuizzes: quizzes.deletedCount || 0,
    deletedInterviews: interviews.deletedCount || 0,
    deletedResumes: resumes.deletedCount || 0,
    deletedUsage: usage.deletedCount || 0,
    deletedUser: user.deletedCount || 0,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Scenario 3: Storage retention policy: Compresses completed quizzes older than retentionDays
 * by clearing verbose question/explanation arrays while keeping metrics (score, percentage, topic, etc.).
 *
 * @param {number} retentionDays - Threshold in days (default: 90 days)
 * @returns {Promise<object>} Compression statistics
 */
export const pruneOrArchiveOldQuizzes = async (retentionDays = 90) => {
  const days = Math.max(1, Number(retentionDays) || 90);
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await Quiz.updateMany(
    {
      status: 'completed',
      completedAt: { $lt: cutoffDate },
      isArchived: false,
    },
    {
      $set: {
        isArchived: true,
        questions: [], // Clears verbose questions & markdown explanations to conserve storage
      },
    }
  );

  return {
    archivedCount: result.modifiedCount || 0,
    retentionDays: days,
    cutoffDate,
  };
};

export default {
  autoSubmitStaleQuizzes,
  cascadeDeleteUserData,
  pruneOrArchiveOldQuizzes,
};

