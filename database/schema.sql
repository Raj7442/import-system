CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  google_drive_id TEXT UNIQUE NOT NULL,
  size BIGINT,
  mime_type TEXT,
  storage_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

