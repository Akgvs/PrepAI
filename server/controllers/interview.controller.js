import Interview from '../models/Interview.model.js';
import { incrementQuota } from '../services/usage.service.js';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from '../services/gemini.service.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const createInterview = async (req, res, next) => {
  try {
    const {
      jobRole,
      jobDescription,
      experienceLevel = 'fresher',
      techStack = '',
      interviewType = 'technical',
      difficulty = 'medium',
      numberOfQuestions = 5,
    } = req.body;

    // Call Gemini to generate questions
    const aiResponse = await generateInterviewQuestions({
      jobRole,
      jobDescription,
      experienceLevel,
      techStack,
      interviewType,
      difficulty,
      numberOfQuestions,
    });

    const rawQuestions = aiResponse.questions || aiResponse;
    const questions = Array.isArray(rawQuestions) ? rawQuestions : [];

    const interview = await Interview.create({
      user: req.user?._id,
      clerkUserId: req.auth.userId,
      jobRole,
      jobDescription,
      experienceLevel,
      techStack,
      interviewType,
      difficulty,
      questions: questions.map((q) => ({
        question: q.question,
        category: q.category || interviewType,
        difficulty: q.difficulty || difficulty,
        expectedConcepts: q.expectedConcepts || [],
      })),
    });

    // Atomically increment usage stats (DRY)
    await incrementQuota(req.auth.userId, 'interviewsGenerated');

    res
      .status(201)
      .json(ApiResponse.success(interview, 'Interview created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ clerkUserId: req.auth.userId })
      .sort({ createdAt: -1 })
      .select('-questions.expectedConcepts');

    res.json(ApiResponse.success(interviews));
  } catch (error) {
    next(error);
  }
};

export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!interview) {
      throw ApiError.notFound('Interview not found');
    }

    res.json(ApiResponse.success(interview));
  } catch (error) {
    next(error);
  }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, answer } = req.body;

    const interview = await Interview.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!interview) {
      throw ApiError.notFound('Interview not found');
    }

    const question = interview.questions.id(questionId);
    if (!question) {
      throw ApiError.notFound('Question not found');
    }

    // Evaluate answer via Gemini
    const evaluation = await evaluateInterviewAnswer({
      jobRole: interview.jobRole,
      experienceLevel: interview.experienceLevel,
      question: question.question,
      expectedConcepts: question.expectedConcepts || [],
      answer,
    });

    question.answer = answer;
    question.score = typeof evaluation.score === 'number' ? evaluation.score : 5;
    question.feedback = evaluation.feedback || '';
    question.strengths = evaluation.strengths || [];
    question.weaknesses = evaluation.weaknesses || [];
    question.missingConcepts = evaluation.missingConcepts || [];
    question.betterAnswer = evaluation.betterAnswer || '';

    if (interview.status === 'created' || interview.status === 'pending') {
      interview.status = 'in-progress';
    }

    await interview.save();

    // Increment answer evaluation quota (DRY)
    await incrementQuota(req.auth.userId, 'answersEvaluated');

    res.json(ApiResponse.success(question, 'Answer evaluated successfully'));
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!interview) {
      throw ApiError.notFound('Interview not found');
    }

    interview.status = 'completed';
    interview.completedAt = new Date();

    // Calculate overall average score
    const evaluated = interview.questions.filter((q) => q.score !== null && q.score !== undefined);
    if (evaluated.length > 0) {
      const sum = evaluated.reduce((acc, q) => acc + q.score, 0);
      interview.overallScore = Math.round((sum / evaluated.length) * 10) / 10;
    }

    await interview.save();

    res.json(ApiResponse.success(interview, 'Interview completed'));
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      clerkUserId: req.auth.userId,
    });

    if (!interview) {
      throw ApiError.notFound('Interview not found');
    }

    res.json(ApiResponse.success(null, 'Interview deleted successfully'));
  } catch (error) {
    next(error);
  }
};
