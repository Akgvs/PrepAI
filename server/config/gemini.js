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
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('Gemini AI initialized (gemini-2.0-flash)');
};

/**
 * Get the initialized Gemini model instance.
 * @returns {GenerativeModel}
 */
export const getGeminiModel = () => {
  if (!model) {
    throw new Error('Gemini not initialized. Call initGemini() first.');
  }
  return model;
};
