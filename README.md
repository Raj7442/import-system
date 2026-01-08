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
