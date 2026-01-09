import express from "express";
import cors from "cors";

import importRoutes from "./routes/import.routes.js";
import imageRoutes from "./routes/images.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.use("/import", importRoutes);
app.use("/images", imageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
