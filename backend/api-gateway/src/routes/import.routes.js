import express from "express";
import { Queue } from "bullmq";

const router = express.Router();
const queue = new Queue("import-queue", {
  connection: { host: "redis", port: 6379 },
});

router.post("/google-drive", async (req, res) => {
  const { folderUrl } = req.body;
  if (!folderUrl) return res.status(400).json({ error: "Folder URL required" });

  await queue.add("import-job", { folderUrl });
  res.json({ message: "Import started" });
});

export default router;

