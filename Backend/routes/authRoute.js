import express from "express";
import { googleAuth, logoutUser } from "../controllers/authController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// 1. Google Authentication Route
router.post("/google", googleAuth);

// 2. Logout Route (FIXED: POST → GET)
router.get("/logout", logoutUser);

// 3. Current User Session Route
router.get("/me", isAuthenticated, (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User session authenticated successfully",
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal error inside user session route",
      error: error.message,
    });
  }
});

export default router;