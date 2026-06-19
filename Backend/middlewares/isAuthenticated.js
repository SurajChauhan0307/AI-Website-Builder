import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    // 1. Pehle cookie check karein, agar block hai toh Authorization header se token nikalen
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]; // "Bearer <TOKEN>" -> "<TOKEN>"
    }

    // 2. Agar dono jagah token nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided"
      });
    }

    // 3. Token verify karein
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // 4. Request object mein user attach karein
    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token"
    });
  }
};