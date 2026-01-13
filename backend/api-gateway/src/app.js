import express from "express";
import cors from "cors";

import importRoutes from "./routes/import.routes.js";
import imageRoutes from "./routes/images.routes.js";

const app = express();

// Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:5173',  // Local Vite dev server
  'http://localhost:3000',  // Local alternative
  'https://chic-joy-production.up.railway.app',  // Your production frontend
  'https://import-system-production.up.railway.app',  // Your backend (for testing)
  process.env.FRONTEND_URL  // Environment variable for flexibility
].filter(Boolean);  // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.use("/import", importRoutes);
app.use("/images", imageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});