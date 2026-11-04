import { callGeminiWithRetry, isAIAvailable } from './geminiClient.js';

export const formatResumeForPrompt = (data) => {
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

export const getMockATSScore = (resumeData) => {
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

/**
 * Score a resume for ATS compatibility.
 */
export const scoreResumeATS = async (resumeData) => {
  if (!isAIAvailable()) {
    console.log('Gemini/Groq API key not configured — using mock ATS score');
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
  if (!isAIAvailable()) {
    console.log('Gemini/Groq API key not configured — using mock STAR rewrite');
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

export default {
  scoreResumeATS,
  rewriteBulletSTAR,
  formatResumeForPrompt,
  getMockATSScore,
};

