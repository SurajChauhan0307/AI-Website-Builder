import 'dotenv/config';
import express from "express";
import connectDB from "./Database/db.js";
import authRoute from "./routes/authRoute.js";
import websiteRoute from "./routes/websiteRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// ✅ DYNAMIC CORS CONFIGURATION FOR PRODUCTION PREVIEW BRANCHES
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman, mobile apps, or server-to-server calls)
      if (!origin) return callback(null, true);

      // Define static allowed origins
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-website-builder-nine-weld.vercel.app" // Main production domain
      ];

      // Dynamically match any Vercel deployment/preview branch related to your project
      const isVercelPreview = origin.endsWith(".vercel.app") && origin.includes("ai-website-builder");

      if (allowedOrigins.includes(origin) || isVercelPreview) {
        callback(null, true);
      } else {
        console.warn(`🛑 Blocked by CORS policy: Origin ${origin} is unauthorized.`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ⚠️ CRUCIAL: Allows cross-domain cookies to be shared between Vercel and Render
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Routes
app.use("/api/auth", authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/payment", paymentRoute);

// DB + Server start (SAFE VERSION)
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed ❌", err);
  });