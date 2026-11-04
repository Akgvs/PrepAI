import parseGeminiResponse from '../../utils/parseGeminiResponse.js';
import ApiError from '../../utils/ApiError.js';
import { isGroqAvailable, getGroqModel } from '../../config/groq.js';

const CANDIDATE_MODELS = [
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

/**
 * Call Groq API with automatic model candidate fallback and progressive backoff.
 *
 * @param {string} prompt - Prompt to send
 * @param {string} operationName - Operation identifier for logs
 * @returns {object} Parsed JSON response
 */
export const callGroqWithRetry = async (prompt, operationName) => {
  if (!isGroqAvailable()) {
    throw ApiError.serviceUnavailable('GROQ_API_KEY is not configured in server/.env.');
  }

  const apiKey = process.env.GROQ_API_KEY.trim();
  const preferredModel = getGroqModel();
  // Build ordered list of unique models to try
  const modelsToTry = [preferredModel, ...CANDIDATE_MODELS.filter((m) => m !== preferredModel)];

  let lastError = null;

  for (const currentModel of modelsToTry) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert technical AI assistant. You must respond strictly in valid JSON format adhering to the user-provided schema. Do not include markdown code fences or conversational preamble.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const is404 = response.status === 404 || errorText.includes('model_not_found');
        if (is404) {
          console.warn(`[Groq Model Fallback] Model ${currentModel} returned 404. Trying next model...`);
          lastError = new Error(`Groq model ${currentModel} not found: ${errorText}`);
          continue; // Try next candidate model immediately
        }
        throw new Error(`Groq API returned [${response.status}]: ${errorText}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned an empty response body');
      }

      return parseGeminiResponse(content);
    } catch (error) {
      lastError = error;
      const errMsg = error.message || '';
      console.error(`Groq ${operationName} [${currentModel}] failed: ${errMsg}`);
    }
  }

  throw ApiError.aiFailure(
    `Groq fallback failed to generate ${operationName}: ${lastError?.message || 'Unknown error'}`
  );
};

export { isGroqAvailable, getGroqModel };

export default {
  callGroqWithRetry,
  isGroqAvailable,
  getGroqModel,
};
