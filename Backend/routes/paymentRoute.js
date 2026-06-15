import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";

const router = express.Router();

// 💳 Route 1: Create payment order (Triggers when user clicks a pricing tier button)
router.post("/order", isAuthenticated, createOrder);

// 🔍 Route 2: Verify signature (Triggers automatically after Razorpay checkout payment success)
router.post("/verify", isAuthenticated, verifyPayment);

// ⚠️ FIXED: Crucial default export so 'import paymentRoute from ...' works flawlessly in index.js
export default router;