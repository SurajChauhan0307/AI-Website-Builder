import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Grab the token from cookies
    const token = req.cookies.token; 

    // 2. If no token, return a clean 401 Unauthorized
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication failed: No token found. Please log in again." 
      });
    }

    // 3. ⚠️ FIXED: Changed JWT_SECRET to SECRET_KEY to match your authController.js
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    // 4. Attach the decoded user payload (_id) to the request object
    req.user = decoded; 
    
    next();
  } catch (error) {
    console.error("🔒 Auth Middleware Error:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Authentication failed: Invalid or expired token." 
    });
  }
};