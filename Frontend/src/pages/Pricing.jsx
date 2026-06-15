import { ArrowLeft, Coins } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    credits: 100,
    description: "Perfect to explore Promptic ai",
    features: ["AI website generation", "Responsive html outputs", "Basic animations"],
    popular: false,
    button: "Get Started",
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    credits: 500,
    description: "For serious creators and freelancers",
    features: ["Everything in Free", "Faster Generations", "Edit and regenerate", "Download Source code"],
    popular: true,
    button: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹1499",
    credits: 1000,
    description: "For teams and power users",
    features: ["Unlimited Iterations", "Highest Priority", "Team Collaboration", "Dedicated Support"],
    popular: false,
    button: "Contact Sales",
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [hovered, setHovered] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const handlePayment = async (plan) => {
    if (plan.id === "free") {
      navigate("/dashboard");
      return;
    }

    try {
      const amount = Number(plan.price.replace(/[₹,]/g, ""));
      const token = localStorage.getItem("token"); // Retrieve token for fallback

      if (!API_BASE_URL) throw new Error("VITE_API_BASE_URL missing");

      // CREATE ORDER
      const result = await axios.post(
        `${API_BASE_URL}/api/payment/order`,
        { planId: plan.id, amount, credits: plan.credits },
        {
          withCredentials: true,
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        }
      );

      const order = result.data;

      if (!window.Razorpay) throw new Error("Razorpay script not loaded");

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Promptic AI",
        description: `${plan.name} - ${plan.credits} Credits`,
        order_id: order.id,

        handler: async function (response) {
          try {
            const verify = await axios.post(
              `${API_BASE_URL}/api/payment/verify`,
              response,
              {
                withCredentials: true,
                headers: { Authorization: token ? `Bearer ${token}` : undefined }
              }
            );

            if (verify.data.success) {
              dispatch(setUserData(verify.data.user));
              navigate("/dashboard");
            }
          } catch (err) {
            console.log("Verification error:", err);
          }
        },
        theme: { color: "#19173d" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.log("Payment initialization error:", error);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white px-6 pt-16 pb-24">
      <button
        onClick={() => navigate("/")}
        className="relative z-10 mb-8 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl mx-auto text-center mb-14"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-zinc-400 text-lg">Buy credit once. Build anytime.</p>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <div
            key={p.id}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div
              animate={{
                scale: hovered === p.id ? 1.05 : 1,
                opacity: hovered && hovered !== p.id ? 0.7 : 1,
              }}
              className="relative h-full rounded-3xl p-8 border backdrop-blur-xl cursor-pointer"
            >
              {p.popular && (
                <span className="absolute top-5 right-5 px-3 py-1 text-xs rounded-full bg-indigo-500">
                  Most Popular
                </span>
              )}
              <h1 className="text-xl font-semibold mb-2">{p.name}</h1>
              <p className="text-zinc-400 text-sm mb-6">{p.description}</p>
              <div className="flex items-end gap-1 mb-4">
                <span className="text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-zinc-400 mb-1">/one-time</span>
              </div>
              <div className="flex items-center gap-2 mb-8">
                <Coins size={18} className="text-yellow-400" />
                <span className="font-semibold">{p.credits} Credits</span>
              </div>
              <button
                onClick={() => handlePayment(p)}
                className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600"
              >
                {p.button}
              </button>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;