import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

/**
 * Initialize the Gemini client.
 * Called once at server startup.
 */
export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY not set — AI features will be unavailable');
    return;
  }

  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  model = genAI.getGenerativeModel({ model: modelName });
  console.log(`Gemini AI initialized (${modelName})`);
};

/**
 * Get the initialized Gemini model instance.
 * @returns {GenerativeModel}
 */
export const getGeminiModel = () => {
  if (!model) {
    if (process.env.GEMINI_API_KEY) {
      initGemini();
    } else {
      throw new Error('Gemini not initialized. Set GEMINI_API_KEY first.');
    }
  }
  return model;
};

export default {
  initGemini,
  getGeminiModel,
};
