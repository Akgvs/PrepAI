import { getGeminiModel } from '../config/gemini.js';
import parseGeminiResponse from '../utils/parseGeminiResponse.js';
import ApiError from '../utils/ApiError.js';

const MAX_RETRIES = 1;

/**
 * Helper to call Gemini and parse JSON response with retry logic.
 *
 * @param {string} prompt - The prompt to send
 * @param {string} operationName - Name for error messages
 * @returns {object} Parsed JSON response
 */
const callGeminiWithRetry = async (prompt, operationName) => {
  const model = getGeminiModel();
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return parseGeminiResponse(text);
    } catch (error) {
      lastError = error;
      console.error(
        `Gemini ${operationName} attempt ${attempt + 1} failed:`,
        error.message
      );

      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  throw ApiError.aiFailure(
    `AI failed to generate valid ${operationName} after ${MAX_RETRIES + 1} attempts. Please try again.`
  );
};

const isGeminiAvailable = () => {
  return Boolean(
    process.env.GEMINI_API_KEY &&
      !process.env.GEMINI_API_KEY.includes('...') &&
      process.env.GEMINI_API_KEY.trim().length > 10
  );
};

const getMockInterviewQuestions = ({
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

const getMockEvaluation = ({ question, expectedConcepts = [], answer }) => {
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
  if (!isGeminiAvailable()) {
    console.log('Gemini API key not configured — using realistic interview questions template');
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
  if (!isGeminiAvailable()) {
    console.log('Gemini API key not configured — using simulated evaluation scorecard');
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

/**
 * Score a resume for ATS compatibility.
 */
export const scoreResumeATS = async (resumeData) => {
  if (!isGeminiAvailable()) {
    console.log('Gemini API key not configured — using mock ATS score');
    return getMockATSScore(resumeData);
  }

  const resumeText = formatResumeForPrompt(resumeData);

  const prompt = `You are an expert ATS (Applicant Tracking System) resume reviewer and career coach.

Analyze the following resume and score it for ATS compatibility.

RESUME:
${resumeText}

${resumeData.targetRole ? `TARGET ROLE: ${resumeData.targetRole}` : ''}

Return a JSON object with this exact structure:
{
  "overall": 75,
  "sections": {
    "contactInfo": 90,
    "summary": 70,
    "experience": 80,
    "education": 85,
    "skills": 60,
    "formatting": 75
  },
  "suggestions": [
    "Add more quantifiable achievements with numbers and percentages",
    "Include relevant keywords from the job description"
  ],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Rules:
- All scores must be 0-100 (integers)
- Provide 3-8 actionable suggestions
- Suggest 5-10 missing keywords relevant to the target role
- Evaluate: contact completeness, summary impact, experience STAR quality, education relevance, skills breadth, and ATS-friendly formatting
- Return ONLY valid JSON, no additional text`;

  return callGeminiWithRetry(prompt, 'ATS resume scoring');
};

/**
 * Rewrite experience bullets using the STAR method.
 */
export const rewriteBulletSTAR = async ({ bullet, role, company }) => {
  if (!isGeminiAvailable()) {
    console.log('Gemini API key not configured — using mock STAR rewrite');
    return {
      rewritten: `Achieved measurable impact by ${bullet.toLowerCase().replace(/^(led|managed|developed|built|created|designed|implemented)/i, 'strategically $1').trim()}, resulting in improved efficiency and team outcomes.`,
    };
  }

  const prompt = `You are an expert resume writer specializing in the STAR method (Situation, Task, Action, Result).

Rewrite the following resume bullet point to be more impactful, using the STAR method. Make it concise, professional, and ATS-friendly.

Original Bullet: "${bullet}"
Role: ${role || 'Not specified'}
Company: ${company || 'Not specified'}

Return a JSON object with this exact structure:
{
  "rewritten": "The improved bullet point text here"
}

Rules:
- Start with a strong action verb
- Include quantifiable results where possible (use realistic estimates if none given)
- Keep it to 1-2 lines maximum
- Make it keyword-rich for ATS systems
- Return ONLY valid JSON, no additional text`;

  return callGeminiWithRetry(prompt, 'STAR bullet rewrite');
};

/* ---- Helper functions for resume AI ---- */

const formatResumeForPrompt = (data) => {
  const parts = [];

  if (data.personalInfo) {
    const pi = data.personalInfo;
    parts.push(`CONTACT: ${pi.fullName || 'N/A'} | ${pi.email || 'N/A'} | ${pi.phone || 'N/A'} | ${pi.location || 'N/A'}`);
    if (pi.linkedin) parts.push(`LinkedIn: ${pi.linkedin}`);
    if (pi.github) parts.push(`GitHub: ${pi.github}`);
  }

  if (data.summary) {
    parts.push(`\nSUMMARY:\n${data.summary}`);
  }

  if (data.experience?.length) {
    parts.push('\nEXPERIENCE:');
    data.experience.forEach((exp) => {
      parts.push(`${exp.role} at ${exp.company} (${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''})`);
      (exp.bullets || []).forEach((b) => {
        const text = typeof b === 'string' ? b : b.text || '';
        if (text) parts.push(`  • ${text}`);
      });
    });
  }

  if (data.education?.length) {
    parts.push('\nEDUCATION:');
    data.education.forEach((edu) => {
      parts.push(`${edu.degree || ''} ${edu.field || ''} — ${edu.institution || ''} (${edu.startDate || ''} - ${edu.endDate || ''})${edu.gpa ? ` GPA: ${edu.gpa}` : ''}`);
    });
  }

  if (data.skills?.length) {
    parts.push(`\nSKILLS: ${data.skills.join(', ')}`);
  }

  if (data.projects?.length) {
    parts.push('\nPROJECTS:');
    data.projects.forEach((proj) => {
      parts.push(`${proj.name}${proj.techStack ? ` (${proj.techStack})` : ''}: ${proj.description || ''}`);
    });
  }

  if (data.certifications?.length) {
    parts.push('\nCERTIFICATIONS:');
    data.certifications.forEach((cert) => {
      parts.push(`${cert.name}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
    });
  }

  return parts.join('\n');
};

const getMockATSScore = (resumeData) => {
  const pi = resumeData.personalInfo || {};
  const hasContact = [pi.fullName, pi.email, pi.phone].filter(Boolean).length;
  const contactScore = Math.min(100, hasContact * 33);
  const summaryScore = resumeData.summary?.length > 50 ? 75 : resumeData.summary?.length > 10 ? 50 : 20;
  const expScore = (resumeData.experience?.length || 0) > 0 ? 70 : 15;
  const eduScore = (resumeData.education?.length || 0) > 0 ? 80 : 20;
  const skillsScore = (resumeData.skills?.length || 0) > 3 ? 75 : (resumeData.skills?.length || 0) > 0 ? 50 : 10;
  const formattingScore = 70;

  const overall = Math.round(
    (contactScore + summaryScore + expScore + eduScore + skillsScore + formattingScore) / 6
  );

  return {
    overall,
    sections: {
      contactInfo: contactScore,
      summary: summaryScore,
      experience: expScore,
      education: eduScore,
      skills: skillsScore,
      formatting: formattingScore,
    },
    suggestions: [
      'Add quantifiable achievements with numbers and percentages to your experience bullets',
      'Include a professional summary that highlights your key qualifications',
      'Add relevant technical skills and keywords for ATS scanning',
      'Use action verbs at the start of each bullet point',
      'Ensure consistent date formatting throughout the resume',
    ],
    keywords: ['problem-solving', 'teamwork', 'leadership', 'communication', 'technical skills'],
  };
};

export default {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  scoreResumeATS,
  rewriteBulletSTAR,
};
