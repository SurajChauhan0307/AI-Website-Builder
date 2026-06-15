import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // ✅ token from cookie OR header
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ IMPORTANT FIX (credits + plan always fresh)
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      credits: user.credits,
      plan: user.plan,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication middleware crash",
    });
  }
};