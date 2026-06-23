import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
  changeWebsite,
  deployWebsite,
  generateWebsite,
  getAllWebsite,
  getBySlug,
  getWebsiteById,
} from "../controllers/websiteController.js";

const router = express.Router();

// Protected routes (require login)
router.post("/generate", isAuthenticated, generateWebsite);
router.post("/update/:id", isAuthenticated, changeWebsite);
router.get("/getbyid/:id", isAuthenticated, getWebsiteById);
router.get("/getall", isAuthenticated, getAllWebsite);
router.get("/deploy/:id", isAuthenticated, deployWebsite);

// ✅ FIX: Public route — deployed sites must be viewable without login
router.get("/getbyslug/:slug", getBySlug);

export default router;