import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import authRoute from "./routes/authRoute.js";
import websiteRoute from "./routes/websiteRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Important for Render cookies (proxy fix)
app.set("trust proxy", 1);

// middleware
app.use(express.json());
app.use(cookieParser());

// ✅ FIXED CORS CONFIG
app.use(
  cors({
    origin: [
      "http://localhost:5173",        // local frontend
      "https://doraai-1.onrender.com" // production frontend
    ],
    credentials: true,
  })
);

// routes
app.use("/api/auth", authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/payment", paymentRoute);

// start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is listening at port: ${PORT}`);
});