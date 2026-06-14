import express from "express"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { createOrder, verifyPayment } from "../controllers/paymentController.js"

const router = express.Router()

// create order
router.post("/order", isAuthenticated, createOrder)

// verify payment
router.post("/verify", isAuthenticated, verifyPayment)

export default router