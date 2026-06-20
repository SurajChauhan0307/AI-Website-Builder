import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Check for token in cookies first, then Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    // 3. Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // 4. Find user and exclude sensitive fields
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // 5. Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    // Distinguish between expired and other errors for better logging
    const message = error.name === "TokenExpiredError" 
      ? "Unauthorized: Token has expired" 
      : "Unauthorized: Invalid token";
      
    return res.status(401).json({
      success: false,
      message: message
    });
  }
};