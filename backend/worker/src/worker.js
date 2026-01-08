import { Worker } from "bullmq";
import axios from "axios";
import { fetchImages } from "./googleDrive.js";
import { uploadToS3 } from "./s3.js";
import { pool } from "./db.js";

new Worker("import-queue", async job => {
  const folderId = job.data.folderUrl.split("/").pop();
  const files = await fetchImages(folderId);

  for (const file of files) {
    const fileRes = await axios.get(file.webContentLink, { responseType: "arraybuffer" });
    const s3Res = await uploadToS3(
      fileRes.data,
      file.name,
      file.mimeType
    );

    await pool.query(
      `INSERT INTO images (name, google_drive_id, size, mime_type, storage_path)
       VALUES ($1,$2,$3,$4,$5)`,
      [file.name, file.id, file.size, file.mimeType, s3Res.Location]
    );
  }
}, { connection: { host: "redis", port: 6379 } });

