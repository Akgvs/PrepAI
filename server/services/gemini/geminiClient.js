import { getGeminiModel } from '../../config/gemini.js';
import parseGeminiResponse from '../../utils/parseGeminiResponse.js';
import ApiError from '../../utils/ApiError.js';
import { callGroqWithRetry, isGroqAvailable, getGroqModel } from './groqClient.js';

const MAX_RETRIES = 2; // Up to 3 Gemini attempts before Groq failover

export const isGeminiAvailable = () => {
  return Boolean(
    process.env.GEMINI_API_KEY &&
      !process.env.GEMINI_API_KEY.includes('...') &&
      process.env.GEMINI_API_KEY.trim().length > 10
  );
};

export const isAIAvailable = () => {
  return isGeminiAvailable() || isGroqAvailable();
};

export { isGroqAvailable, getGroqModel };

/**
 * Helper to call Gemini (targeting gemini-3.8-flash) with progressive exponential backoff.
 * If Gemini fails or experiences high demand/service unavailable, automatically falls over to Groq.
 *
 * @param {string} prompt - The prompt to send
 * @param {string} operationName - Name for error messages
 * @returns {object} Parsed JSON response
 */
export const callGeminiWithRetry = async (prompt, operationName) => {
  // If Gemini is not configured but Groq is, directly call Groq
  if (!isGeminiAvailable()) {
    if (isGroqAvailable()) {
      console.log(`[AI Routing] Gemini not configured. Directly using Groq (${getGroqModel()}) for ${operationName}...`);
      return callGroqWithRetry(prompt, operationName);
    }
    throw ApiError.serviceUnavailable(
      'No AI service configured. Please set GEMINI_API_KEY or GROQ_API_KEY in server/.env.'
    );
  }

  const model = getGeminiModel();
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return parseGeminiResponse(text);
    } catch (error) {
      lastError = error;
      const errMsg = error.message || '';

      const isHighDemandOrOverloaded =
        errMsg.includes('503') ||
        errMsg.includes('high demand') ||
        errMsg.includes('Service Unavailable') ||
        errMsg.includes('UNAVAILABLE');

      const isRateLimit =
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('quota');

      console.error(
        `Gemini ${operationName} [${modelName}] attempt ${attempt + 1}/${MAX_RETRIES + 1} failed: ${errMsg}`
      );

      // If Groq is available and Gemini returned a 503 High Demand or 404, fail over immediately without burning retry delays
      if (isGroqAvailable() && (isHighDemandOrOverloaded || errMsg.includes('404'))) {
        console.warn(
          `[AI Failover] Gemini returned high demand/unavailable for ${operationName}. Fast-failing over to Groq (${getGroqModel()})...`
        );
        try {
          const groqResult = await callGroqWithRetry(prompt, operationName);
          console.log(`[AI Failover] Successfully generated ${operationName} using Groq fallback.`);
          return groqResult;
        } catch (groqErr) {
          console.error(`[AI Failover] Groq fallback failed: ${groqErr.message}. Resuming Gemini retry...`);
        }
      }

      if (attempt < MAX_RETRIES) {
        // Exponential backoff with jitter
        const baseDelay = isHighDemandOrOverloaded || isRateLimit
          ? 2000 * Math.pow(1.8, attempt)
          : 1000 * Math.pow(1.5, attempt);
        const jitter = Math.floor(Math.random() * 800);
        const delay = Math.round(baseDelay + jitter);

        console.log(`[Gemini Retry] Waiting ${delay}ms before retrying ${modelName}...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // If all Gemini attempts failed, attempt final Groq failover
  if (isGroqAvailable()) {
    console.warn(
      `[AI Failover] All Gemini attempts failed for ${operationName}. Final failover to Groq (${getGroqModel()})...`
    );
    try {
      const groqResult = await callGroqWithRetry(prompt, operationName);
      console.log(`[AI Failover] Successfully generated ${operationName} using Groq fallback.`);
      return groqResult;
    } catch (groqErr) {
      console.error(`[AI Failover] Groq fallback also failed for ${operationName}: ${groqErr.message}`);
    }
  }

  const is503 =
    lastError?.message?.includes('503') ||
    lastError?.message?.includes('high demand') ||
    lastError?.message?.includes('Service Unavailable');

  if (is503) {
    throw ApiError.serviceUnavailable(
      'AI service is currently experiencing high demand. Please try again in a few moments.'
    );
  }

  throw ApiError.aiFailure(
    `AI failed to generate valid ${operationName}: ${lastError?.message || 'Unknown error'}. Please try again.`
  );
};

export default {
  callGeminiWithRetry,
  isGeminiAvailable,
  isGroqAvailable,
  isAIAvailable,
  getGroqModel,
};
