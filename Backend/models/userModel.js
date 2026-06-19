import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },

    avatar: {
      type: String,
      default: null
    },

    credits: {
      type: Number,
      default: 100,
      min: 0
    },

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
      index: true
    }
  },
  { timestamps: true }
);

// extra safety: faster login + lookup optimization
userSchema.index({ email: 1 });

export const User = mongoose.model("User", userSchema);