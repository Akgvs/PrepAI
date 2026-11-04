import { pruneOrArchiveOldQuizzes } from '../services/userCleanup.service.js';
import Quiz from '../models/Quiz.model.js';
import { incrementQuota } from '../services/usage.service.js';
import { generateQuizQuestions } from '../services/gemini.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Mask sensitive test answers while the quiz is ongoing.
 */
const sanitizeQuizForActiveSession = (quizDoc) => {
  const quizObj = quizDoc.toObject ? quizDoc.toObject() : { ...quizDoc };
  if (quizObj.status !== 'completed' && Array.isArray(quizObj.questions)) {
    quizObj.questions = quizObj.questions.map((q) => {
      const { correctAnswer, explanation, ...safeQuestion } = q;
      return safeQuestion;
    });
  }
  return quizObj;
};

/**
 * POST /api/quizzes — Generate and create a new MCQ quiz session
 */
export const createQuiz = async (req, res, next) => {
  try {
    const {
      title,
      topic = 'Full-Stack Development',
      techStack = '',
      focusAreas = '',
      difficulty = 'medium',
      numberOfQuestions = 5,
      timeLimitMinutes = 10,
    } = req.body;

    const quizTitle =
      title?.trim() ||
      `${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Assessment`;

    // 1. Generate questions via Gemini (or fallback template)
    const count = Math.min(Math.max(Number(numberOfQuestions) || 5, 3), 15);
    const aiResponse = await generateQuizQuestions({
      topic,
      techStack,
      focusAreas,
      difficulty,
      numberOfQuestions: count,
    });

    const rawQuestions = aiResponse.questions || aiResponse;
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

    if (!questions.length) {
      throw ApiError.aiFailure('Failed to generate quiz questions. Please try again.');
    }

    // 2. Persist to MongoDB
    const quiz = await Quiz.create({
      user: req.user?._id,
      clerkUserId: req.auth.userId,
      title: quizTitle,
      topic,
      techStack,
      focusAreas,
      difficulty,
      numberOfQuestions: questions.length,
      timeLimitMinutes: Number(timeLimitMinutes) || 10,
      status: 'in-progress',
      // Scenario 1: TTL index will auto-delete abandoned quiz after 24h
      expireAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      questions: questions.map((q) => ({
        question: q.question,
        codeSnippet: q.codeSnippet || '',
        options: q.options || [],
        correctAnswer: Number(q.correctAnswer) || 0,
        explanation: q.explanation || 'No explanation provided.',
        topicTag: q.topicTag || topic,
        difficulty: q.difficulty || difficulty,
      })),
    });

    // 3. Atomically track usage
    await incrementQuota(req.auth.userId, 'quizzesGenerated');

    // 4. Return sanitized version for client test taking
    const safeQuiz = sanitizeQuizForActiveSession(quiz);

    res
      .status(201)
      .json(ApiResponse.success(safeQuiz, 'Quiz generated successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quizzes — Get user's quiz history with metrics
 */
export const getUserQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ clerkUserId: req.auth.userId })
      .sort({ createdAt: -1 })
      .select(
        'title topic techStack focusAreas difficulty numberOfQuestions score percentage passed status timeSpentSeconds timeLimitMinutes createdAt completedAt'
      );

    res.json(ApiResponse.success(quizzes));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quizzes/:id — Get details of a single quiz
 */
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!quiz) {
      throw ApiError.notFound('Quiz session not found');
    }

    // Scenario 1: Auto-finalize in-progress quiz if elapsed time exceeds time limit + 5 min grace
    if (quiz.status === 'in-progress' && quiz.createdAt) {
      const timeLimitMs = (quiz.timeLimitMinutes || 10) * 60 * 1000;
      const graceMs = 5 * 60 * 1000;
      const createdAtMs = new Date(quiz.createdAt).getTime();

      if (Date.now() - createdAtMs > timeLimitMs + graceMs) {
        let correctCount = 0;
        quiz.questions.forEach((q) => {
          const hasAnswer =
            q.userAnswer !== null &&
            q.userAnswer !== undefined &&
            Number.isInteger(Number(q.userAnswer));
          q.isCorrect = hasAnswer && Number(q.userAnswer) === q.correctAnswer;
          if (q.isCorrect) correctCount += 1;
        });

        const totalQuestions = quiz.questions.length || 1;
        const percentage = Math.round((correctCount / totalQuestions) * 100);

        quiz.score = correctCount;
        quiz.percentage = percentage;
        quiz.passed = percentage >= 60;
        quiz.performanceSummary = 'Assessment auto-finalized after the allotted time limit elapsed.';
        quiz.status = 'completed';
        quiz.completedAt = new Date();
        quiz.expireAt = null; // Clear TTL so completed quiz is preserved
        await quiz.save();
      }
    }

    const safeQuiz = sanitizeQuizForActiveSession(quiz);
    res.json(ApiResponse.success(safeQuiz));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quizzes/:id/submit — Submit answers and evaluate score
 */
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers = [], timeSpentSeconds = 0 } = req.body;

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!quiz) {
      throw ApiError.notFound('Quiz session not found');
    }

    // ACID / Idempotency: If already completed, return existing graded document
    if (quiz.status === 'completed') {
      return res.json(ApiResponse.success(quiz, 'Quiz is already evaluated'));
    }

    let correctCount = 0;

    // Grade each question
    quiz.questions.forEach((q, idx) => {
      // Find candidate answer by question _id or index
      const candidateAns = answers.find(
        (a) =>
          (a.questionId && String(a.questionId) === String(q._id)) ||
          a.questionIndex === idx
      );

      const isInteger =
        candidateAns &&
        candidateAns.selectedOption !== undefined &&
        candidateAns.selectedOption !== null &&
        Number.isInteger(Number(candidateAns.selectedOption));

      const chosenOption = isInteger ? Number(candidateAns.selectedOption) : null;
      const isValidOption =
        chosenOption !== null &&
        chosenOption >= 0 &&
        chosenOption < (Array.isArray(q.options) ? q.options.length : 4);

      q.userAnswer = isValidOption ? chosenOption : null;
      q.isCorrect = isValidOption && chosenOption === q.correctAnswer;

      if (q.isCorrect) {
        correctCount += 1;
      }
    });

    const totalQuestions = quiz.questions.length || 1;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= 60;

    let performanceSummary = '';
    if (percentage >= 90) {
      performanceSummary = 'Mastery level! Excellent grasp of both fundamental and edge-case concepts.';
    } else if (percentage >= 75) {
      performanceSummary = 'Solid performance! Good core knowledge with minor room for improvement on nuanced topics.';
    } else if (percentage >= 60) {
      performanceSummary = 'Passing standard. Review the detailed explanations below to shore up knowledge gaps.';
    } else {
      performanceSummary = 'Needs study. Focus on the core topics highlighted in the review breakdown and try another practice run.';
    }

    quiz.score = correctCount;
    quiz.percentage = percentage;
    quiz.passed = passed;
    quiz.performanceSummary = performanceSummary;
    quiz.timeSpentSeconds = Math.max(0, Number(timeSpentSeconds) || 0);
    quiz.status = 'completed';
    quiz.completedAt = new Date();
    // Scenario 1: Clear TTL index to prevent auto-deletion of completed quizzes
    quiz.expireAt = null;

    await quiz.save();

    // Now that quiz is completed, full answers and explanations are returned
    res.json(ApiResponse.success(quiz, 'Quiz evaluated and submitted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/quizzes/:id — Delete a quiz record
 */
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!quiz) {
      throw ApiError.notFound('Quiz not found or unauthorized');
    }

    res.json(ApiResponse.success(null, 'Quiz deleted successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/quizzes/maintenance/archive-old — Scenario 3: Storage retention cleanup
 */
export const archiveOldQuizzes = async (req, res, next) => {
  try {
    const { retentionDays = 90 } = req.body;
    const result = await pruneOrArchiveOldQuizzes(Number(retentionDays) || 90);
    res.json(
      ApiResponse.success(
        result,
        `Successfully archived ${result.archivedCount} quizzes older than ${result.retentionDays} days`
      )
    );
  } catch (error) {
    next(error);
  }
};
