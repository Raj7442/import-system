import express from "express";
import cors from "cors";

import importRoutes from "./routes/import.routes.js";
import imageRoutes from "./routes/images.routes.js";

const app = express();

app.use(
  cors({
    origin: "*", // 👈 IMPORTANT FOR PRODUCTION
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
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
