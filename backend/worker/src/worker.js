import { Worker } from "bullmq";
import { google } from "googleapis";
import AWS from "aws-sdk";
import fetch from "node-fetch";
import pkg from "pg";

const { Pool } = pkg;

/* ---------------- POSTGRES ---------------- */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* ---------------- AWS S3 ---------------- */

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

/* ---------------- GOOGLE DRIVE ---------------- */

const drive = google.drive({
  version: "v3",
  auth: process.env.GOOGLE_API_KEY, // public folder access
});

/* ---------------- WORKER ---------------- */

new Worker(
  "import-queue",
  async (job) => {
    const { folderUrl } = job.data;
    console.log("📂 Importing folder:", folderUrl);

    /* 1️⃣ Extract folder ID */
    const folderId = folderUrl.split("/folders/")[1];
    if (!folderId) throw new Error("Invalid Google Drive folder URL");

    /* 2️⃣ Fetch images from Google Drive */
    const res = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, size, mimeType)",
    });

    const files = res.data.files || [];
    console.log(`🖼️ Found ${files.length} images`);

    /* 3️⃣ Process each image */
    for (const file of files) {
      console.log("⬇️ Downloading:", file.name);

      const download = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_API_KEY}`
      );

      const buffer = await download.buffer();

      /* 4️⃣ Upload to S3 */
      console.log("☁️ Uploading to S3:", file.name);

      const uploadResult = await s3
        .upload({
          Bucket: process.env.S3_BUCKET,
          Key: file.name,
          Body: buffer,
          ContentType: file.mimeType,
        })
        .promise();

      /* 5️⃣ Save metadata in PostgreSQL */
      await pool.query(
        `INSERT INTO images
         (name, google_drive_id, size, mime_type, storage_path)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (google_drive_id) DO NOTHING`,
        [
          file.name,
          file.id,
          file.size,
          file.mimeType,
          uploadResult.Location,
        ]
      );

      console.log("✅ Saved:", file.name);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || "redis",
      port: process.env.REDIS_PORT || 6379,
      maxRetriesPerRequest: null,
    },
  }
);
