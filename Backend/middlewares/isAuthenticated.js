import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Extract token from cookie OR Authorization header
    // Added a trim() to handle potential spacing issues in headers
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token || 
      (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // 3. Find user
    const user = await User.findById(decoded._id).select("-password"); // Optimization: exclude password

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Attach user data
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
      message: "Authentication middleware internal error",
    });
  }
};