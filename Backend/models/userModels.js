import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: String,
    credits: { type: Number, default: 100, min: 0 },
    plan: { type: String, enum: ["Free", "Pro", "Enterprise"], default: "Free" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;