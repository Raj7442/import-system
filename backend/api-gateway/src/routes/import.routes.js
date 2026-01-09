import express from "express";
import { Queue } from "bullmq";

const router = express.Router();

const queue = new Queue("import-queue", {
  connection: {
    host: process.env.REDIS_HOST || "redis",
    port: process.env.REDIS_PORT || 6379,
  },
});

router.post("/google-drive", async (req, res) => {
  try {
    const { folderUrl } = req.body;

    if (!folderUrl) {
      return res.status(400).json({ error: "Folder URL required" });
    }

    await queue.add("import-job", { folderUrl });

    res.json({ message: "Import started" });
  } catch (err) {
    console.error("Queue error:", err);
    res.status(500).json({ error: "Failed to start import" });
  }
});

export default router;
