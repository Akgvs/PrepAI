import { callGeminiWithRetry, isAIAvailable } from './geminiClient.js';

export const getMockInterviewQuestions = ({
  jobRole,
  techStack,
  interviewType = 'technical',
  difficulty = 'medium',
  numberOfQuestions = 5,
}) => {
  const stack = techStack ? techStack.split(',').map((s) => s.trim()) : ['Modern Architecture'];
  const baseQuestions = [
    {
      question: `Can you walk me through your experience as a ${jobRole}, specifically highlighting how you approach complex problems using ${stack[0] || 'core technologies'}?`,
      category: interviewType,
      difficulty,
      expectedConcepts: ['Problem solving', 'System design', stack[0] || 'Core architecture'],
    },
    {
      question: `How do you handle scalability and performance optimization when working with ${stack.join(', ') || 'production systems'}?`,
      category: interviewType,
      difficulty,
      expectedConcepts: ['Caching', 'Database indexing', 'Asynchronous processing', 'Latency profiling'],
    },
    {
      question: `Describe a challenging bug or technical roadblock you encountered recently in a project. How did you diagnose and resolve it?`,
      category: interviewType,
      difficulty,
      expectedConcepts: ['Root cause analysis', 'Debugging tools', 'Regression testing', 'Post-mortem'],
    },
    {
      question: `In a fast-paced environment, how do you balance code quality, test coverage, and meeting strict delivery deadlines?`,
      category: interviewType,
      difficulty,
      expectedConcepts: ['SOLID principles', 'Automated testing', 'CI/CD pipelines', 'Technical debt management'],
    },
    {
      question: `What architectural patterns or best practices do you consider indispensable when designing modern full-stack web applications?`,
      category: interviewType,
      difficulty,
      expectedConcepts: ['Modular architecture', 'State management', 'API contract design', 'Security'],
    },
  ];

  return {
    questions: baseQuestions.slice(0, Math.min(numberOfQuestions, baseQuestions.length)),
  };
};

export const getMockEvaluation = ({ question, expectedConcepts = [], answer }) => {
  const words = (answer || '').trim().split(/\s+/).filter(Boolean);
  const length = words.length;

  let score = 5;
  if (length > 80) score = 8;
  else if (length > 40) score = 7;
  else if (length > 15) score = 6;
  else score = 4;

  const concepts = Array.isArray(expectedConcepts) ? expectedConcepts : [];

  return {
    score,
    strengths: [
      length > 20 ? 'Clear articulation of ideas' : 'Direct and concise response',
      'Demonstrates fundamental understanding of the core topic',
    ],
    weaknesses: [
      length < 40
        ? 'Could elaborate further with specific real-world examples'
        : 'Consider discussing edge cases and trade-offs',
      'Mention metrics or quantitative outcomes achieved',
    ],
    missingConcepts: concepts.slice(0, 2),
    feedback: `Good effort! Your response touches on key principles. To make this an exceptional interview answer, provide concrete production examples, discuss trade-offs, and structure your explanation using the STAR (Situation, Task, Action, Result) format.`,
    betterAnswer: `A top-tier answer should explicitly cover ${concepts.join(', ') || 'the primary technical requirements'}. Start with a high-level summary, outline your technical decision-making rationale, discuss trade-offs or alternatives considered, and conclude with measurable impact.`,
  };
};

/**
 * Generate interview questions based on configuration.
 */
export const generateInterviewQuestions = async ({
  jobRole,
  jobDescription,
  experienceLevel,
  techStack,
  interviewType = 'technical',
  difficulty = 'medium',
  numberOfQuestions = 5,
}) => {
  if (!isAIAvailable()) {
    console.log('Gemini/Groq API key not configured — using realistic interview questions template');
    return getMockInterviewQuestions({
      jobRole,
      techStack,
      interviewType,
      difficulty,
      numberOfQuestions,
    });
  }

  const prompt = `You are an expert interviewer. Generate exactly ${numberOfQuestions} interview questions for the following position.

Job Role: ${jobRole}
Job Description: ${jobDescription}
Experience Level: ${experienceLevel}
Tech Stack: ${techStack || 'Not specified'}
Interview Type: ${interviewType}
Difficulty: ${difficulty}

Return your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "The interview question text",
      "category": "${interviewType}",
      "difficulty": "${difficulty}",
      "expectedConcepts": ["concept1", "concept2", "concept3"]
    }
  ]
}

Rules:
- Generate exactly ${numberOfQuestions} questions
- Each question must have 2-5 expected concepts
- Questions should be relevant to the job role, tech stack, and experience level
- For "${interviewType}" type interviews, tailor questions accordingly
- Return ONLY valid JSON, no additional text`;

  return callGeminiWithRetry(prompt, 'interview questions');
};

/**
 * Evaluate a candidate's answer to an interview question.
 */
export const evaluateInterviewAnswer = async ({
  jobRole,
  experienceLevel,
  question,
  expectedConcepts = [],
  answer,
}) => {
  if (!isAIAvailable()) {
    console.log('Gemini/Groq API key not configured — using simulated evaluation scorecard');
    return getMockEvaluation({ question, expectedConcepts, answer });
  }

  const conceptsStr = Array.isArray(expectedConcepts)
    ? expectedConcepts.join(', ')
    : String(expectedConcepts);

  const prompt = `You are an expert interviewer evaluating a candidate's answer.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Question: ${question}
Expected Concepts: ${conceptsStr}
Candidate's Answer: ${answer}

Evaluate the answer and return a JSON object with this exact structure:
{
  "score": 7,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "missingConcepts": ["concept1"],
  "feedback": "Detailed feedback paragraph about the answer",
  "betterAnswer": "A model answer that covers all expected concepts"
}

Rules:
- Score must be 0-10 (integer)
- Be fair but thorough in evaluation
- Provide actionable feedback
- The better answer should be comprehensive but concise
- Return ONLY valid JSON, no additional text`;

  return callGeminiWithRetry(prompt, 'answer evaluation');
};

export default {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getMockInterviewQuestions,
  getMockEvaluation,
};

