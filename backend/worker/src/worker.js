import { Worker } from "bullmq";
import { google } from "googleapis";
import AWS from "aws-sdk";
import fetch from "node-fetch";
import pkg from "pg";
import { Buffer } from "buffer";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("PostgreSQL connection error:", err);
});

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn("AWS credentials not set. S3 uploads will fail.");
}

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();

if (!process.env.GOOGLE_API_KEY) {
  console.warn("GOOGLE_API_KEY not set. Google Drive access will fail.");
}

const drive = google.drive({
  version: "v3",
});

console.log("Worker starting...");
console.log("Environment check:");
console.log("  - DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Missing");
console.log("  - AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "Set" : "Missing");
console.log("  - AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "Set" : "Missing");
console.log("  - S3_BUCKET:", process.env.S3_BUCKET || "Missing");
console.log("  - GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Set" : "Missing");
console.log("  - REDIS_HOST:", process.env.REDIS_HOST || "redis");
console.log("  - REDIS_PORT:", process.env.REDIS_PORT || 6379);

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
      
      if (!folderId) {
        throw new Error("Could not extract folder ID from URL");
      }

      console.log(`[Job ${job.id}] Folder ID: ${folderId}`);

      const files = [];
      let pageToken = null;
      let pageCount = 0;

      do {
        const res = await drive.files.list({
          q: `'${folderId}' in parents and mimeType contains 'image/'`,
          fields: "nextPageToken, files(id, name, size, mimeType, webContentLink)",
          pageSize: 1000,
          pageToken: pageToken,
          key: process.env.GOOGLE_API_KEY,
        });

        if (res.data.files) {
          files.push(...res.data.files);
        }

        pageToken = res.data.nextPageToken;
        pageCount++;
        console.log(`[Job ${job.id}] Fetched page ${pageCount}, total files: ${files.length}`);
      } while (pageToken);

      console.log(`[Job ${job.id}] Found ${files.length} images across ${pageCount} page(s)`);

      if (files.length === 0) {
        console.log(`[Job ${job.id}] No images found in folder`);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        try {
          console.log(`[Job ${job.id}] Downloading: ${file.name} (${file.id})`);

          let downloadUrl;
          let download;

          if (file.webContentLink) {
            downloadUrl = file.webContentLink;
            download = await fetch(downloadUrl);
          } else {
            downloadUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_API_KEY}`;
            download = await fetch(downloadUrl);
          }

          if (!download.ok) {
            console.log(`[Job ${job.id}] Trying alternative download method for: ${file.name}`);
            const fileDetails = await drive.files.get({
              fileId: file.id,
              fields: "webContentLink, webViewLink",
              key: process.env.GOOGLE_API_KEY,
            });

            if (fileDetails.data.webContentLink) {
              downloadUrl = fileDetails.data.webContentLink;
              download = await fetch(downloadUrl);
            } else {
              throw new Error(`Failed to download: ${download.status} ${download.statusText}. File may not be public.`);
            }
          }

          if (!download.ok) {
            throw new Error(`Failed to download: ${download.status} ${download.statusText}`);
          }

          const arrayBuffer = await download.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          console.log(`[Job ${job.id}] Uploading to S3: ${file.name}`);

          if (!process.env.S3_BUCKET) {
            throw new Error("S3_BUCKET environment variable not set");
          }

          const s3Key = `${folderId}/${file.id}_${file.name}`;

          const uploadResult = await s3
            .upload({
              Bucket: process.env.S3_BUCKET,
              Key: s3Key,
              Body: buffer,
              ContentType: file.mimeType || "image/jpeg",
            })
            .promise();

          await pool.query(
            `INSERT INTO images
             (name, google_drive_id, size, mime_type, storage_path)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (google_drive_id) DO UPDATE SET
               name = EXCLUDED.name,
               size = EXCLUDED.size,
               mime_type = EXCLUDED.mime_type,
               storage_path = EXCLUDED.storage_path`,
            [
              file.name,
              file.id,
              file.size || 0,
              file.mimeType || "image/jpeg",
              uploadResult.Location,
            ]
          );

          successCount++;
          console.log(`[Job ${job.id}] Saved: ${file.name} (${successCount}/${files.length})`);
        } catch (fileError) {
          errorCount++;
          console.error(`[Job ${job.id}] Error processing ${file.name}:`, fileError.message);
        }
      }

      console.log(`[Job ${job.id}] Import complete: ${successCount} succeeded, ${errorCount} failed`);
    } catch (error) {
      console.error(`[Job ${job.id}] Fatal error:`, error);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "redis",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    },
    concurrency: 5,
  }
);

console.log("Worker ready and listening for jobs...");
