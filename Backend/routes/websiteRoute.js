import express from "express";

import {
  changeWebsite,
  deployWebsite,
  generateWebsite,
  getBySlug,
  getWebsiteById,
  getAllWebsite,
  getWebsiteVersions // Make sure to add this import
} from "../controller/websiteController.js";

import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateWebsite);

router.post("/update/:id", isAuthenticated, changeWebsite);

router.get("/getbyid/:id", isAuthenticated, getWebsiteById);

router.get("/getall", isAuthenticated, getAllWebsite);

router.get("/deploy/:id", isAuthenticated, deployWebsite);

router.get("/getbyslug/:slug", getBySlug);

router.get(
   "/versions/:id",
   isAuthenticated,
   getWebsiteVersions
);

export default router;