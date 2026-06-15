import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js"; // Model import karo

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed: No token found." 
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // 🚨 CRITICAL FIX: decoded._id se database mein User ko dhoondo 
    // aur pura object req.user mein store karo
    const user = await User.findById(decoded._id);
    
    if (!user) {
        return res.status(401).json({ success: false, message: "User not found." });
    }

    req.user = user; // 👈 Ab controller ko pura user object milega (credits, plan, name)
    
    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Error:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed: Invalid or expired token." 
    });
  }
};