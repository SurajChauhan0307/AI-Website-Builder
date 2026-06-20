import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Check for token in Authorization header, then in cookies
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.token;

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
    const message = error.name === "TokenExpiredError" 
      ? "Unauthorized: Token has expired" 
      : "Unauthorized: Invalid token";
      
    return res.status(401).json({
      success: false,
      message: message
    });
  }
};