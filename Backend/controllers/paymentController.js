import razorpayInstance from "../config/razorpay.js";
import { Payment } from "../models/paymentModel.js";
import crypto from "crypto";
import { User } from "../models/userModel.js";

export const createOrder = async (req, res) => {
  try {
    const { planId, amount, credits } = req.body;

    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        merchant_name: "Promptic Ai",
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    await Payment.create({
      userId: req.user._id,
      planId,
      amount,
      credits,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
    });

    return res.json(razorpayOrder);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Payment Signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(400).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      return res.json({ message: "Already processed" });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    if (!payment.userId) {
      return res.status(500).json({
        message: "User ID missing in payment record",
      });
    }

    const updateUser = await User.findByIdAndUpdate(
      payment.userId,
      {
        $inc: { credits: payment.credits },
        plan: payment.planId,
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Payment Verified and Credit added",
      user: updateUser,
    });
  } catch (error) {
    console.error("❌ Error in verifyPayment:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};