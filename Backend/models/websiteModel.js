import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "ai"],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { timestamps: true })

const websiteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    title: {
        type: String,
        default: "Untitled Website"
    },

    latestCode: {
        type: String,
        required: true,
        index: true
    },

    conversation: {
        type: [messageSchema],
        default: []
    },

    deployed: {
        type: Boolean,
        default: false,
        index: true
    },

    deployUrl: {
        type: String,
        default: null
    },

    slug: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    }

}, { timestamps: true })

// performance optimization
websiteSchema.index({ user: 1, createdAt: -1 })

export const Website = mongoose.model("Website", websiteSchema)