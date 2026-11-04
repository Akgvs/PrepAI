/**
 * Groq AI Configuration & Initialization
 */

export const isGroqAvailable = () => {
  return Boolean(
    process.env.GROQ_API_KEY &&
      !process.env.GROQ_API_KEY.includes('...') &&
      process.env.GROQ_API_KEY.trim().length > 10
  );
};

export const getGroqModel = () => {
  return process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
};

export const initGroq = () => {
  if (isGroqAvailable()) {
    console.log(`Groq AI initialized (${getGroqModel()}) [Active Fallback]`);
  } else {
    console.log('Groq AI fallback not configured (optional: set GROQ_API_KEY in server/.env)');
  }
};

export default {
  initGroq,
  isGroqAvailable,
  getGroqModel,
};

