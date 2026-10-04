import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },

    interviewsGenerated: { type: Number, default: 0 },
    answersEvaluated: { type: Number, default: 0 },
    resumesCreated: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one usage document per user per month
usageSchema.index({ clerkUserId: 1, month: 1, year: 1 }, { unique: true });

const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
