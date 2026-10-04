import mongoose from 'mongoose';

const bulletSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    rewritten: { type: String, default: '' },
  },
  { _id: true }
);

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    bullets: [bulletSchema],
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true },
    degree: { type: String, default: '' },
    field: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    gpa: { type: String, default: '' },
  },
  { _id: true }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    techStack: { type: String, default: '' },
    link: { type: String, default: '' },
  },
  { _id: true }
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    issuer: { type: String, default: '' },
    date: { type: String, default: '' },
  },
  { _id: true }
);

const atsScoreSchema = new mongoose.Schema(
  {
    overall: { type: Number, default: null, min: 0, max: 100 },
    sections: {
      contactInfo: { type: Number, default: null },
      summary: { type: Number, default: null },
      experience: { type: Number, default: null },
      education: { type: Number, default: null },
      skills: { type: Number, default: null },
      formatting: { type: Number, default: null },
    },
    suggestions: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
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

    title: { type: String, default: 'Untitled Resume' },
    targetRole: { type: String, default: '' },

    personalInfo: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },

    summary: { type: String, default: '' },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: { type: [String], default: [] },
    projects: [projectSchema],
    certifications: [certificationSchema],

    atsScore: { type: atsScoreSchema, default: () => ({}) },

    status: {
      type: String,
      enum: ['draft', 'scored'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
