# Image Import System – Google Drive to Cloud Storage

A scalable, multi-service backend system that imports images from a public Google Drive folder, stores them in cloud object storage, persists metadata in a SQL database, and exposes APIs for managing and retrieving image data. A simple frontend is provided to interact with the system.

---

## 🚀 Live Application

**Frontend:** https://image-import-frontend.onrender.com  
**Backend API:** https://image-import-api.onrender.com

---

## 📌 Features

- Import images from a **public Google Drive folder**
- Upload images to **cloud object storage (AWS S3)**
- Persist image metadata in a **SQL database (PostgreSQL)**
- Asynchronous, scalable processing for **large imports (10,000+ images)**
- REST APIs for importing and listing images
- Simple frontend to trigger imports and view images
- Fully **Dockerized** and **cloud-ready**

---

## 🏗️ Architecture Overview

This system follows a **multi-service architecture** to ensure scalability, fault tolerance, and maintainability.

### Services

1. **API Gateway**
   - Exposes REST APIs
   - Accepts Google Drive folder URLs
   - Enqueues import jobs

2. **Import Worker**
   - Consumes jobs asynchronously
   - Fetches images from Google Drive
   - Uploads images to AWS S3
   - Stores metadata in PostgreSQL

3. **PostgreSQL**
   - Stores image metadata:
     - name
     - google_drive_id
     - size
     - mime_type
     - storage_path

4. **Redis**
   - Message queue (BullMQ) for background jobs

5. **Frontend (React)**
   - Form to submit Google Drive folder URL
   - Displays list of imported images

---

## 🚀 Setup Instructions

### Prerequisites

- Docker and Docker Compose
- AWS Account with S3 bucket (or MinIO for local development)
- Google Cloud Project with Drive API enabled
- Node.js 18+ (for local development)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/images

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET=your_s3_bucket_name

# Google Drive API
GOOGLE_API_KEY=your_google_api_key

# API Gateway Port (optional)
PORT=3000
```

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd import-system
   ```

2. **Create `.env` file** with your credentials (see above)

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - API Gateway: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Cloud Deployment

The system is designed to be deployed on any container orchestration platform:

- **Kubernetes**: Deploy each service as a separate deployment with appropriate config maps and secrets
- **AWS ECS/Fargate**: Use task definitions for each service
- **Docker Compose**: Suitable for smaller deployments
- **Render/Railway**: Can deploy individual services or use docker-compose

**Important**: Ensure all environment variables are set in your deployment platform.

---

## 📡 API Documentation

### Base URL

- Local: `http://localhost:3000`
- Production: `https://image-import-api.onrender.com`

### Endpoints

#### 1. Import Images from Google Drive

**POST** `/import/google-drive`

Starts an asynchronous import job for images from a public Google Drive folder.

**Request Body:**
```json
{
  "folderUrl": "https://drive.google.com/drive/folders/FOLDER_ID"
}
```

**Response:**
```json
{
  "message": "Import started",
  "jobId": "job-id-123"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/import/google-drive \
  -H "Content-Type: application/json" \
  -d '{"folderUrl": "https://drive.google.com/drive/folders/FOLDER_ID"}'
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid folder URL
- `500 Internal Server Error`: Failed to queue the import job

#### 2. Get All Imported Images

**GET** `/images`

Returns a list of all imported images with their metadata.

**Response:**
```json
[
  {
    "id": 1,
    "name": "image.jpg",
    "google_drive_id": "file-id-123",
    "size": 1024000,
    "mime_type": "image/jpeg",
    "storage_path": "https://s3.amazonaws.com/bucket/folder-id/file-id-123_image.jpg",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
]
```

**Example using cURL:**
```bash
curl http://localhost:3000/images
```

---

## 🏗️ Scalability & Large-Scale Imports

### How the System Handles 10,000+ Images

1. **Asynchronous Processing**
   - Import requests are queued immediately (non-blocking)
   - Worker processes jobs in the background
   - Multiple workers can run concurrently

2. **Queue-Based Architecture**
   - Uses BullMQ (Redis) for job queuing
   - Jobs are persisted and can be retried on failure
   - Supports job prioritization and rate limiting

3. **Concurrent Processing**
   - Worker configured with `concurrency: 5` to process multiple images simultaneously
   - Can scale horizontally by adding more worker instances
   - Each worker processes files independently

4. **Fault Tolerance**
   - Failed jobs are automatically retried (3 attempts with exponential backoff)
   - Individual file failures don't stop the entire import
   - Database uses `ON CONFLICT` to handle duplicate imports gracefully

5. **Database Optimization**
   - Uses PostgreSQL with proper indexing on `google_drive_id`
   - Batch operations where possible
   - Connection pooling for efficient database access

6. **Cloud Storage**
   - Direct uploads to S3 (no intermediate storage)
   - Files are organized by folder ID to avoid conflicts
   - Public read access for easy retrieval

### Scaling Recommendations

- **Horizontal Scaling**: Add more worker instances to process jobs faster
- **Database**: Use read replicas for the `/images` endpoint if needed
- **Redis**: Use Redis Cluster for high availability
- **S3**: Configure lifecycle policies and CDN (CloudFront) for better performance
- **Monitoring**: Add job monitoring (BullMQ Dashboard) to track progress

---

## 🧪 Testing

### Manual Testing

1. **Test Import Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/import/google-drive \
     -H "Content-Type: application/json" \
     -d '{"folderUrl": "YOUR_GOOGLE_DRIVE_FOLDER_URL"}'
   ```

2. **Check Imported Images:**
   ```bash
   curl http://localhost:3000/images
   ```

3. **Monitor Worker Logs:**
   ```bash
   docker-compose logs -f worker
   ```

### Postman Collection

A Postman collection is available in the repository root (if provided) with pre-configured requests.

---
