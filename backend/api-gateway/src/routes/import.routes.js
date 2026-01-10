import express from "express";
import { Queue } from "bullmq";

const router = express.Router();

/* -------------------- BullMQ Queue (Railway FIX) -------------------- */
const queue = new Queue("import-queue", {
  connection: {
    url: process.env.REDIS_URL, // ✅ REQUIRED ON RAILWAY
  },
});

/* -------------------- Routes -------------------- */
router.post("/google-drive", async (req, res) => {
  try {
    const { folderUrl } = req.body;

    if (!folderUrl) {
      return res.status(400).json({ error: "Folder URL required" });
    }

    if (
      !folderUrl.includes("drive.google.com") ||
      !folderUrl.includes("/folders/")
    ) {
      return res.status(400).json({ error: "Invalid Google Drive folder URL" });
    }

    const job = await queue.add(
      "import-job",
      { folderUrl },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    res.json({
      message: "Import started",
      jobId: job.id,
    });
  } catch (err) {
    console.error("Queue error:", err);
    res.status(500).json({
      error: "Failed to start import",
      details: err.message,
    });
  }
});

export default router;
