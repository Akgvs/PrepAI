import mongoose from 'mongoose';

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    options: {
      type: [String],
      required: true,
      validate: [
        (opts) => opts.length >= 2,
        'Question must have at least 2 options',
      ],
    },
    // Index of the correct option (0 to options.length - 1)
    correctAnswer: {
      type: Number,
      required: true,
    },
    // Comprehensive explanation for learning
    explanation: {
      type: String,
      required: true,
    },
    topicTag: {
      type: String,
      default: 'General',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    // Candidate's submission
    userAnswer: {
      type: Number,
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: null,
    },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    techStack: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'mixed'],
      default: 'medium',
    },
    numberOfQuestions: {
      type: Number,
      default: 5,
    },
    timeLimitMinutes: {
      type: Number,
      default: 10,
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['created', 'in-progress', 'completed'],
      default: 'created',
      index: true,
    },
    score: {
      type: Number,
      default: null,
    },
    percentage: {
      type: Number,
      default: null,
    },
    passed: {
      type: Boolean,
      default: null,
    },
    performanceSummary: {
      type: String,
      default: '',
    },
    questions: [quizQuestionSchema],
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
