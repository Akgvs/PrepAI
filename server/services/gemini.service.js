/**
 * Gemini AI Services - Barrel aggregator for backward compatibility.
 * Modular implementations live in:
 * - ./gemini/geminiClient.js   (Base Gemini client, retry, API availability)
 * - ./gemini/geminiQuiz.service.js   (Quiz generation, Fisher-Yates option shuffle)
 * - ./gemini/geminiMock.service.js   (Mock interview questions & evaluation)
 * - ./gemini/geminiResume.service.js (ATS resume scoring & STAR bullet rewriting)
 */

export * from './gemini/index.js';
export { default } from './gemini/index.js';
