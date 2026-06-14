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

// CORS CONFIG (IMPORTANT FIX)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://prompticai.vercel.app"
    ],
    credentials: true,
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