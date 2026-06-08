import express from "express";
import { googleAuth, logoutUser } from "../controller/authController.js";

const router = express.Router();

router.post("/google", googleAuth);
router.get("/logout", logoutUser);

export default router;