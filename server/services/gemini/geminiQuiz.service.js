import { callGeminiWithRetry, isAIAvailable } from './geminiClient.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Fisher-Yates shuffle for MCQ options to neutralize LLM answer-index position bias.
 * Re-indexes the correctAnswer pointer so the correct option is uniformly distributed.
 *
 * @param {object} question - Single question object
 * @returns {object} Question with randomized options and re-indexed correctAnswer
 */
export const shuffleQuestionOptions = (question) => {
  if (!question || !Array.isArray(question.options) || question.options.length < 2) {
    return question;
  }

  const rawCorrectIndex = Number.isInteger(Number(question.correctAnswer))
    ? Number(question.correctAnswer)
    : 0;

  // Track the correct answer by indexing original position
  const indexed = question.options.map((opt, idx) => ({
    text: String(opt),
    isCorrect: idx === rawCorrectIndex,
  }));

  // In-place Fisher-Yates shuffle
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }

  const newCorrectIndex = indexed.findIndex((item) => item.isCorrect);

  return {
    ...question,
    options: indexed.map((item) => item.text),
    correctAnswer: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
};

/**
 * Generate multiple choice quiz questions based on topic, tech stack, focus areas, and difficulty.
 */
export const generateQuizQuestions = async ({
  topic,
  techStack,
  focusAreas = '',
  difficulty = 'medium',
  numberOfQuestions = 5,
}) => {
  if (!isAIAvailable()) {
    throw ApiError.serviceUnavailable(
      'AI service is not configured. Please set GEMINI_API_KEY or GROQ_API_KEY in server/.env to generate dynamic AI quizzes.'
    );
  }

  const focusInstruction = focusAreas?.trim()
    ? `Specific Focus Areas / Concepts to cover: ${focusAreas.trim()}`
    : 'Coverage: Comprehensive balance of core theory, practical real-world scenarios, and architectural patterns.';

  const difficultyInstruction =
    difficulty === 'mixed'
      ? 'Adaptive Difficulty: Provide a progressive mix: ~20% easy fundamentals, ~60% medium practical implementation, ~20% hard edge cases/performance. Tag each question\'s "difficulty" appropriately.'
      : `Target Difficulty: ${difficulty}. Calibrate all questions strictly to this level.`;

  const prompt = `You are a principal engineer and senior technical assessor.
Generate exactly ${numberOfQuestions} technical multiple choice questions (MCQs) for a practice skill assessment.

Topic: ${topic}
Tech Stack: ${techStack || topic}
${focusInstruction}
${difficultyInstruction}

Return your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Clear and conceptual question text",
      "codeSnippet": "Optional concise code block (JavaScript, SQL, HTML, etc.) if code analysis/debugging is tested, or empty string",
      "options": [
        "First plausible option",
        "Second plausible option",
        "Third plausible option",
        "Fourth plausible option"
      ],
      "correctAnswer": 0,
      "explanation": "Clear, educational explanation of why the correct option is right and why others are wrong.",
      "topicTag": "Specific Subtopic (e.g. React Reconciliation, Event Loop, Indexing)",
      "difficulty": "${difficulty === 'mixed' ? 'medium' : difficulty}"
    }
  ]
}

Rules:
- Generate exactly ${numberOfQuestions} questions.
- Each question MUST have exactly 4 plausible, distinct options. Avoid trivial 'All of the above' or 'None of the above'.
- "correctAnswer" MUST be the 0-based integer index of the correct option (0, 1, 2, or 3).
- "explanation" must be educational, actionable, and clear.
- Questions should test real engineering understanding, practical edge cases, and performance nuances.
- Return ONLY valid JSON, no markdown code fence and no additional text.`;

  const rawResponse = await callGeminiWithRetry(prompt, 'quiz questions');
  const rawList = Array.isArray(rawResponse)
    ? rawResponse
    : Array.isArray(rawResponse?.questions)
    ? rawResponse.questions
    : [];

  // Defensive validation and sanitization
  const validatedQuestions = rawList
    .filter(
      (q) =>
        q &&
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length >= 2
    )
    .map((q) => {
      const parsedAns = Number(q.correctAnswer);
      const safeCorrectAnswer =
        Number.isInteger(parsedAns) && parsedAns >= 0 && parsedAns < q.options.length
          ? parsedAns
          : 0;

      const normalizedQuestion = {
        question: q.question.trim(),
        codeSnippet: typeof q.codeSnippet === 'string' ? q.codeSnippet.trim() : '',
        options: q.options.map((opt) => String(opt).trim()),
        correctAnswer: safeCorrectAnswer,
        explanation:
          typeof q.explanation === 'string' && q.explanation.trim()
            ? q.explanation.trim()
            : 'Review the underlying concepts to understand this solution.',
        topicTag:
          typeof q.topicTag === 'string' && q.topicTag.trim()
            ? q.topicTag.trim()
            : topic,
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty)
          ? q.difficulty
          : difficulty === 'mixed'
          ? 'medium'
          : difficulty,
      };

      // Neutralize LLM position bias by shuffling options
      return shuffleQuestionOptions(normalizedQuestion);
    });

  if (!validatedQuestions.length) {
    throw ApiError.aiFailure(
      'Gemini AI failed to return valid quiz questions. Please try again with different topics or focus areas.'
    );
  }

  return { questions: validatedQuestions };
};

export default {
  generateQuizQuestions,
  shuffleQuestionOptions,
};

