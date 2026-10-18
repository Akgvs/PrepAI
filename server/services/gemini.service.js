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

const getMockQuizQuestions = ({
  topic = 'General Tech',
  techStack = '',
  difficulty = 'medium',
  numberOfQuestions = 5,
}) => {
  const normalized = `${topic} ${techStack}`.toLowerCase();

  const reactQuestions = [
    {
      question: 'What happens when a React component re-renders?',
      codeSnippet: '',
      options: [
        'The entire DOM tree is completely destroyed and reconstructed from scratch.',
        'The component function re-executes, creates a new Virtual DOM tree, and React reconciles diffs with the real DOM.',
        'Only variables marked with the `static` keyword are preserved.',
        'React freezes state mutations until the browser repaints the layout.',
      ],
      correctAnswer: 1,
      explanation: 'In React, re-rendering triggers execution of the component function, generating a new Virtual DOM representation. React’s diffing algorithm (Reconciliation) identifies differences with the previous snapshot and minimally updates the actual browser DOM.',
      topicTag: 'React Reconciliation',
      difficulty: 'medium',
    },
    {
      question: 'Why should you avoid using array indices as `key` props for dynamically rendered lists?',
      codeSnippet: 'items.map((item, index) => <ListItem key={index} data={item} />);',
      options: [
        'React throws a compilation error in production if indices are used.',
        'It causes memory leaks because index keys are stored in global browser caches.',
        'It can break component state and cause UI glitches when items are reordered, inserted, or removed.',
        'Keys must always be 64-bit UUID strings according to the HTML5 specification.',
      ],
      correctAnswer: 2,
      explanation: 'Using an index as a key confuses React reconciliation when list order changes. Uncontrolled child state (like input values or animations) can get associated with the wrong item.',
      topicTag: 'React Keys',
      difficulty: 'medium',
    },
    {
      question: 'What is the purpose of the `useEffect` cleanup function?',
      codeSnippet: 'useEffect(() => {\n  const sub = api.subscribe();\n  return () => sub.unsubscribe();\n}, []);',
      options: [
        'To reset component state variables back to their default initial values.',
        'To clean up subscriptions, timers, or event listeners before the component unmounts or before re-running the effect.',
        'To immediately trigger a garbage collection cycle in the V8 engine.',
        'To serialize the DOM node for server-side rendering hydration.',
      ],
      correctAnswer: 1,
      explanation: 'The return function in `useEffect` is the cleanup callback. React runs it when unmounting and before subsequent executions of the effect to prevent memory leaks and dangling listeners.',
      topicTag: 'React Hooks',
      difficulty: 'easy',
    },
    {
      question: 'How does React 18 Concurrent Mode improve user experience during heavy state transitions?',
      codeSnippet: '',
      options: [
        'It converts client-side JavaScript into multi-threaded Web Workers automatically.',
        'It enables interruptible rendering, allowing high-priority events (e.g. typing) to interrupt lower-priority render passes.',
        'It forces all CSS animations to run on the GPU instead of the CPU.',
        'It caches all HTTP requests in the browser Service Worker.',
      ],
      correctAnswer: 1,
      explanation: 'Concurrent React allows rendering to be paused, resumed, or discarded. Urgent updates (clicks, keystrokes) can preempt long background computations (like large list filtering).',
      topicTag: 'React Concurrent',
      difficulty: 'hard',
    },
    {
      question: 'When using `useMemo`, what is the primary consideration?',
      codeSnippet: 'const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);',
      options: [
        'It should be wrapped around every single variable definition in your application.',
        'It guarantees that memory consumption will decrease across all browser tabs.',
        'The overhead of memory allocation and dependency checks should not outweigh the cost of the calculation itself.',
        'It allows asynchronous promises to resolve synchronously without `await`.',
      ],
      correctAnswer: 2,
      explanation: 'Overusing `useMemo` introduces memory overhead and dependency comparison cost. It should be reserved for genuinely expensive calculations or keeping reference identity stable.',
      topicTag: 'Performance Optimization',
      difficulty: 'medium',
    },
  ];

  const backendQuestions = [
    {
      question: 'In Node.js, which phase of the Event Loop executes callbacks scheduled by `setImmediate()`?',
      codeSnippet: '',
      options: [
        'The Timers phase',
        'The Poll phase',
        'The Check phase',
        'The Close callbacks phase',
      ],
      correctAnswer: 2,
      explanation: 'The `check` phase of the Node.js event loop executes callbacks scheduled by `setImmediate()`. This occurs immediately after the `poll` phase completes.',
      topicTag: 'Node.js Event Loop',
      difficulty: 'medium',
    },
    {
      question: 'What is the purpose of database indexing on frequently filtered columns?',
      codeSnippet: 'CREATE INDEX idx_users_email ON users(email);',
      options: [
        'To encrypt user emails at rest for GDPR compliance.',
        'To enable O(log N) or hash lookups instead of doing full table scans (O(N)).',
        'To automatically compress disk storage and reduce memory usage.',
        'To enforce foreign key cascade deletes.',
      ],
      correctAnswer: 1,
      explanation: 'Database indexes (typically B-Trees) enable rapid logarithmic searches without scanning every row in the table, drastically reducing disk I/O and query latency.',
      topicTag: 'Database Indexing',
      difficulty: 'easy',
    },
    {
      question: 'What distinguishes idempotency in HTTP methods like PUT and DELETE compared to POST?',
      codeSnippet: '',
      options: [
        'PUT and DELETE can only accept URL parameters, not JSON request bodies.',
        'Multiple identical idempotent requests have the same side-effect on the server as a single request.',
        'POST requests are automatically cached by browser CDNs, whereas PUT never is.',
        'Idempotent methods cannot return HTTP error status codes.',
      ],
      correctAnswer: 1,
      explanation: 'An HTTP method is idempotent if making the identical request multiple times produces the same server state as making it once. PUT and DELETE are idempotent; POST is typically non-idempotent.',
      topicTag: 'REST API Design',
      difficulty: 'medium',
    },
    {
      question: 'What is connection pooling in backend databases?',
      codeSnippet: '',
      options: [
        'A technique that caches full SQL query results in Redis forever.',
        'Maintaining a cache of open database connections to reuse across requests, avoiding expensive TCP/TLS handshake overhead.',
        'Clustering multiple database replicas behind a round-robin DNS server.',
        'A protocol for compressing database backups before sending them to cloud storage.',
      ],
      correctAnswer: 1,
      explanation: 'Opening a new database connection involves TCP and TLS handshakes plus authentication. A connection pool keeps reusable connections alive for incoming requests.',
      topicTag: 'System Performance',
      difficulty: 'medium',
    },
    {
      question: 'What is the primary vulnerability prevented by using parameterized SQL queries?',
      codeSnippet: 'db.query("SELECT * FROM users WHERE id = $1", [userId]);',
      options: [
        'Cross-Site Scripting (XSS)',
        'SQL Injection (SQLi)',
        'Server-Side Request Forgery (SSRF)',
        'Denial of Service (DoS)',
      ],
      correctAnswer: 1,
      explanation: 'Parameterized queries treat user input strictly as literal data rather than executable SQL syntax, completely neutralizing SQL Injection attacks.',
      topicTag: 'Web Security',
      difficulty: 'easy',
    },
  ];

  const pool = normalized.includes('react') || normalized.includes('front')
    ? reactQuestions
    : backendQuestions;

  // If more questions requested, generate variations
  const result = [];
  for (let i = 0; i < numberOfQuestions; i++) {
    const template = pool[i % pool.length];
    result.push({
      ...template,
      question: i >= pool.length ? `[Follow-up] ${template.question}` : template.question,
      difficulty,
    });
  }

  return { questions: result };
};

/**
 * Generate multiple choice quiz questions based on topic and tech stack.
 */
export const generateQuizQuestions = async ({
  topic,
  techStack,
  difficulty = 'medium',
  numberOfQuestions = 5,
}) => {
  if (!isGeminiAvailable()) {
    console.log('Gemini API key not configured — using realistic quiz questions template');
    return getMockQuizQuestions({
      topic,
      techStack,
      difficulty,
      numberOfQuestions,
    });
  }

  const prompt = `You are a principal engineer and senior technical assessor.
Generate exactly ${numberOfQuestions} technical multiple choice questions (MCQs) for a practice skill assessment.

Topic: ${topic}
Tech Stack: ${techStack || topic}
Difficulty: ${difficulty}

Return your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Clear and conceptual question text",
      "codeSnippet": "Optional snippet if code analysis is required, or empty string",
      "options": [
        "First plausible option",
        "Second plausible option",
        "Third plausible option",
        "Fourth plausible option"
      ],
      "correctAnswer": 0,
      "explanation": "Clear, educational explanation of why the correct option is right and why others are wrong.",
      "topicTag": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}

Rules:
- Generate exactly ${numberOfQuestions} questions.
- Each question MUST have exactly 4 plausible options.
- "correctAnswer" MUST be the 0-based integer index of the correct option (0, 1, 2, or 3).
- "explanation" must be educational, actionable, and clear.
- Questions should test real engineering understanding, practical edge cases, and performance nuances.
- Return ONLY valid JSON, no markdown code fence and no additional text.`;

  return callGeminiWithRetry(prompt, 'quiz questions');
};

export default {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  scoreResumeATS,
  rewriteBulletSTAR,
  generateQuizQuestions,
};

