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
      difficulty = 'medium',
      numberOfQuestions = 5,
      timeLimitMinutes = 10,
    } = req.body;

    const quizTitle =
      title?.trim() ||
      `${topic} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Assessment`;

    // 1. Generate questions via Gemini (or fallback template)
    const aiResponse = await generateQuizQuestions({
      topic,
      techStack,
      difficulty,
      numberOfQuestions: Math.min(Math.max(Number(numberOfQuestions) || 5, 3), 15),
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
      difficulty,
      numberOfQuestions: questions.length,
      timeLimitMinutes: Number(timeLimitMinutes) || 10,
      status: 'in-progress',
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
        'title topic techStack difficulty numberOfQuestions score percentage passed status timeSpentSeconds timeLimitMinutes createdAt completedAt'
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

      const chosenOption =
        candidateAns && candidateAns.selectedOption !== undefined && candidateAns.selectedOption !== null
          ? Number(candidateAns.selectedOption)
          : null;

      q.userAnswer = chosenOption;
      q.isCorrect = chosenOption !== null && chosenOption === q.correctAnswer;

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
