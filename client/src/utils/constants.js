export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher' },
  { value: '1-2 years', label: '1-2 Years' },
  { value: '3-5 years', label: '3-5 Years' },
  { value: '5+ years', label: '5+ Years' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical & Coding' },
  { value: 'behavioral', label: 'Behavioral & Situational' },
  { value: 'hr', label: 'HR & Culture Fit' },
  { value: 'mixed', label: 'Mixed (Technical + Behavioral)' },
];

export const QUESTION_COUNTS = [3, 5, 7, 10];

export const NAV_LINKS = [
  { name: 'Mock Interviews', path: '/dashboard/mocks' },
  { name: 'ATS Resumes', path: '/dashboard/resumes' },
  { name: 'Pricing', path: '/pricing' },
];

export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free Starter',
    tagline: 'Ideal for practicing core interview fundamentals with Gemini AI.',
    priceMonthly: 0,
    priceYearly: 0,
    interviewQuota: '5 Free Interviews',
    isPopular: false,
    badge: 'Starter Tier',
    badgeVariant: 'slate',
    ctaText: 'Get Started Free',
    features: [
      { text: '5 AI Mock Interviews', included: true, highlight: true },
      { text: 'Real-time Voice Speech-to-Text', included: true },
      { text: 'Audio Question Playback', included: true },
      { text: 'Webcam Video Tracking', included: true },
      { text: 'STAR Method Scoring & Feedback', included: true },
      { text: 'Standard Job Role & Stack Presets', included: true },
      { text: 'Unlimited Sessions & No Quotas', included: false },
      { text: 'Priority Gemini 2.0 Flash Speed', included: false },
    ],
  },
  {
    id: 'paid',
    name: 'Unlimited Pro',
    tagline: 'Unrestricted practice with priority AI for ambitious candidates.',
    priceMonthly: 19,
    priceYearly: 15,
    interviewQuota: 'Unlimited Interviews',
    isPopular: true,
    badge: 'Most Popular',
    badgeVariant: 'indigo',
    ctaText: 'Upgrade to Unlimited',
    features: [
      { text: 'Unlimited AI Mock Interviews (No Cap)', included: true, highlight: true },
      { text: 'Priority Gemini 2.0 Flash Processing', included: true },
      { text: 'Up to 10 Questions Per Interview Session', included: true },
      { text: 'Comprehensive STAR Gap Analysis', included: true },
      { text: 'Real-time Voice Speech & Audio Playback', included: true },
      { text: 'Custom Tech Stacks & Tailored Prompts', included: true },
      { text: 'Detailed Score & Performance Tracking', included: true },
      { text: 'Priority 24/7 Candidate Support', included: true },
    ],
  },
];

