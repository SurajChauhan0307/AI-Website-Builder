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

// Generate AI website
router.post("/generate", isAuthenticated, generateWebsite);

// Update website
router.post("/update/:id", isAuthenticated, changeWebsite);

// Get single website by ID
router.get("/getbyid/:id", isAuthenticated, getWebsiteById);

// Get all websites
router.get("/getall", isAuthenticated, getAllWebsite);

// Deploy website
router.get("/deploy/:id", isAuthenticated, deployWebsite);

// Get website by slug
router.get("/getbyslug/:slug", isAuthenticated, getBySlug);

export default router;