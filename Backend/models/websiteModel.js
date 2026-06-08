import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: String,

    latestCode: String,

    // Your added version history array
    versions: [
      {
        code: String,
        prompt: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    conversation: [
      {
        role: String,
        content: String,
      },
    ],

    deployed: {
      type: Boolean,
      default: false,
    },

    deployedUrl: String,

    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Performance optimization index for public route lookups
websiteSchema.index({ slug: 1 });

const Website = mongoose.model("Website", websiteSchema);

export default Website;