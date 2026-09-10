import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: '',
    },
    plan: {
      type: String,
      enum: ['free', 'paid', 'monthly', 'yearly'],
      default: 'free',
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

export default User;
