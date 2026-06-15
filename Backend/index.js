import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {

    console.log("========== AUTH DEBUG ==========");
    console.log("COOKIE TOKEN:", req.cookies?.token);
    console.log("AUTH HEADER:", req.headers.authorization);
    console.log("================================");

    const authHeader = req.headers.authorization;

    const token =
      req.cookies?.token ||
      (authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader);

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

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

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