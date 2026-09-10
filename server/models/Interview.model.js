import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: '' },
    difficulty: { type: String, default: '' },
    expectedConcepts: { type: [String], default: [] },

    // Filled after user answers
    answer: { type: String, default: '' },
    feedback: { type: String, default: '' },
    score: { type: Number, default: null },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    missingConcepts: { type: [String], default: [] },
    betterAnswer: { type: String, default: '' },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },

    // Interview configuration
    jobRole: { type: String, required: true },
    jobDescription: { type: String, required: true },
    experienceLevel: {
      type: String,
      enum: ['fresher', '1-2 years', '3-5 years', '5+ years'],
      required: true,
    },
    techStack: { type: String, default: '' },
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'hr', 'mixed'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },

    // Generated questions with evaluation data
    questions: [questionSchema],

    overallScore: { type: Number, default: null },
    status: {
      type: String,
      enum: ['created', 'in-progress', 'completed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
