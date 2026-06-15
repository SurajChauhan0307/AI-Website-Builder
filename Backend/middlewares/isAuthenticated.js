import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // ✅ FIX 1: cookie OR header support
    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token found"
      });
    }

    // ✅ FIX 2: verify token safely
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    // ✅ FIX 3: user fetch
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ attach full user
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication middleware crash"
    });
  }
};