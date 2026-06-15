import "dotenv/config";
import express from "express";
import connectDB from "./Database/db.js";
import authRoute from "./routes/authRoute.js";
import websiteRoute from "./routes/websiteRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

/* ---------------- MIDDLEWARE ORDER FIX ---------------- */

// 1. CORS FIRST (GOOD)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-website-builder-nine-weld.vercel.app"
      ];

      const isVercelPreview =
        origin.endsWith(".vercel.app") &&
        origin.includes("ai-website-builder");

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// 2. IMPORTANT FIX (COOKIE PARSER BEFORE ROUTES)
app.use(cookieParser());

// 3. BODY PARSER (RECOMMENDED ORDER FIX)
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/auth", authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/payment", paymentRoute);

/* ---------------- DB + SERVER ---------------- */
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed ❌", err);
  });