import Razorpay from "razorpay";
import dotenv from "dotenv";

// Extra layer of safety to ensure env values are read within this config context
dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;