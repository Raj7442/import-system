import express from "express";
import importRoutes from "./routes/import.routes.js";
import imageRoutes from "./routes/images.routes.js";

const app = express();
app.use(express.json());

app.use("/import", importRoutes);
app.use("/images", imageRoutes);

export default app;

