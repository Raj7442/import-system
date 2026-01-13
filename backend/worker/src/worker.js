import { Worker } from "bullmq";
import { google } from "googleapis";
import { Storage } from "@google-cloud/storage";
import fetch from "node-fetch";
import pkg from "pg";
import { Buffer } from "buffer";

const { Pool } = pkg;

/* -------------------- PostgreSQL -------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

/* -------------------- Google Cloud Storage -------------------- */
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Google Cloud Storage will fail.");
}

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Optional: for service account
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
});

const bucket = storage.bucket(process.env.GCS_BUCKET || 'image-import-bucket-2025');

/* -------------------- Google Drive -------------------- */
if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Google Drive access will fail.");
}

const drive = google.drive({
  version: "v3",
});

/* -------------------- Startup Logs -------------------- */
console.log("Worker starting...");
console.log("Environment check:");
console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Missing");
console.log("  - GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Set" : "Missing");
console.log("  - GCS_BUCKET:", process.env.GCS_BUCKET ? "Set" : "Missing");
console.log("  - GOOGLE_CLOUD_PROJECT_ID:", process.env.GOOGLE_CLOUD_PROJECT_ID ? "Set" : "Missing");
console.log("  - REDIS_URL:", process.env.REDIS_URL ? "Set" : "Missing");

/* -------------------- BullMQ Worker -------------------- */
new Worker(
  "import-queue",
  async (job) => {
    const { folderUrl } = job.data;
    console.log(`[Job ${job.id}] Importing folder: ${folderUrl}`);

    try {
      let folderId = folderUrl.split("/folders/")[1];
      if (!folderId) {
        throw new Error("Invalid Google Drive folder URL format");
      }

      folderId = folderId.split("?")[0].split("/")[0];
      console.log(`[Job ${job.id}] Folder ID: ${folderId}`);

      const files = [];
      let pageToken = null;
      let pageCount = 0;

      do {
        const res = await drive.files.list({
          q: `'${folderId}' in parents and mimeType contains 'image/'`,
          fields: "nextPageToken, files(id, name, size, mimeType, webContentLink)",
          pageSize: 1000,
          pageToken,
          key: process.env.GOOGLE_API_KEY,
        });

        if (res.data.files) {
          files.push(...res.data.files);
        }

        pageToken = res.data.nextPageToken;
        pageCount++;
        console.log(
          `[Job ${job.id}] Fetched page ${pageCount}, total files: ${files.length}`
        );
      } while (pageToken);

      if (files.length === 0) {
        console.log(`[Job ${job.id}] No images found`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          console.log(`[Job ${job.id}] Downloading: ${file.name}`);

          let downloadUrl = file.webContentLink
            ? file.webContentLink
            : `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_API_KEY}`;

          const download = await fetch(downloadUrl);

          if (!download.ok) {
            throw new Error(`Failed to download ${file.name}`);
          }

          const buffer = Buffer.from(await download.arrayBuffer());

          // Upload to Google Cloud Storage
          const fileName = `${folderId}/${file.id}_${file.name}`;
          const gcsFile = bucket.file(fileName);
          
          await gcsFile.save(buffer, {
            metadata: {
              contentType: file.mimeType || 'image/jpeg',
            },
            public: true, // Make file publicly accessible
          });

          // Get public URL
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          await pool.query(
            `
            INSERT INTO images
              (name, google_drive_id, size, mime_type, storage_path)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (google_drive_id)
            DO UPDATE SET
              name = EXCLUDED.name,
              size = EXCLUDED.size,
              mime_type = EXCLUDED.mime_type,
              storage_path = EXCLUDED.storage_path
            `,
            [
              file.name,
              file.id,
              file.size || 0,
              file.mimeType || "image/jpeg",
              publicUrl,
            ]
          );

          successCount++;
          console.log(`[Job ${job.id}] Saved: ${file.name}`);
        } catch (err) {
          errorCount++;
          console.error(`[Job ${job.id}] Error processing ${file.name}:`, err.message);
        }
      }

      console.log(
        `[Job ${job.id}] Import complete: ${successCount} succeeded, ${errorCount} failed`
      );
    } catch (error) {
      console.error(`[Job ${job.id}] Fatal error:`, error);
      throw error;
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL, // ✅ RAILWAY FIX
      maxRetriesPerRequest: null,
    },
    concurrency: 5,
  }
);

console.log("Worker ready and listening for jobs...");
