import express from "express";
import "dotenv/config";
import connectDB from "./database/db.js";
import authRoute from "./routes/authRoute.js";
import websiteRoute from "./routes/websiteRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app  = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" })); // AI responses can be large
app.use(cookieParser());

// ✅ FIX: CORS reads allowed origins from env so you never need to redeploy
// just to add a new frontend URL.
// On Render set: ALLOWED_ORIGINS=https://your-app.vercel.app,https://custom-domain.com
const getAllowedOrigins = () => {
  const base = [
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  if (process.env.FRONTEND_URL) {
    base.push(process.env.FRONTEND_URL);
  }

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(",").forEach((o) => base.push(o.trim()));
  }

  return base;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server (no origin) and all vercel.app previews
      if (!origin) return callback(null, true);

      const allowed = getAllowedOrigins();
      if (
        allowed.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app")
      ) {
        return callback(null, true);
      }

      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/auth",    authRoute);
app.use("/api/website", websiteRoute);
app.use("/api/payment", paymentRoute);

// Health check — Render pings this to keep the server alive
app.get("/health", (_, res) => res.json({ status: "ok" }));

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server listening on port ${PORT}`);
});