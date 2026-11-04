export * from './geminiClient.js';
export * from './groqClient.js';
export * from './geminiMock.service.js';
export * from './geminiQuiz.service.js';
export * from './geminiResume.service.js';

import {
  callGeminiWithRetry,
  isGeminiAvailable,
  isGroqAvailable,
  isAIAvailable,
  getGroqModel,
} from './geminiClient.js';
import { callGroqWithRetry } from './groqClient.js';
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getMockInterviewQuestions,
  getMockEvaluation,
} from './geminiMock.service.js';
import {
  generateQuizQuestions,
  shuffleQuestionOptions,
} from './geminiQuiz.service.js';
import {
  scoreResumeATS,
  rewriteBulletSTAR,
  formatResumeForPrompt,
  getMockATSScore,
} from './geminiResume.service.js';

export default {
  callGeminiWithRetry,
  callGroqWithRetry,
  isGeminiAvailable,
  isGroqAvailable,
  isAIAvailable,
  getGroqModel,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getMockInterviewQuestions,
  getMockEvaluation,
  generateQuizQuestions,
  shuffleQuestionOptions,
  scoreResumeATS,
  rewriteBulletSTAR,
  formatResumeForPrompt,
  getMockATSScore,
};
