# Production Deployment Fix Guide

## Issues Found and Fixed

### 1. Frontend API URL Configuration
- **Problem**: Frontend was using `VITE_API_URL` but Dockerfile expects `VITE_API_BASE_URL`
- **Fix**: Updated `frontend/src/api.js` to use correct environment variable

### 2. Missing Redis URL Configuration
- **Problem**: Backend import route expects `REDIS_URL` but it wasn't configured
- **Fix**: Added `REDIS_URL` to environment configuration

### 3. Docker Build Configuration
- **Problem**: Frontend Docker build wasn't receiving API URL
- **Fix**: Updated `docker-compose.yml` to pass build arguments

## Railway Deployment Steps

### For Backend Services (API Gateway & Worker):

1. **Set Environment Variables in Railway:**
   ```
   DATABASE_URL=<your_railway_postgres_url>
   REDIS_URL=<your_railway_redis_url>
   AWS_ACCESS_KEY_ID=your_aws_access_key_here
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key_here
   AWS_REGION=ap-south-1
   S3_BUCKET=image-import-123
   GOOGLE_API_KEY=your_google_api_key_here
   PORT=3000
   ```

### For Frontend Service:

1. **Set Build-time Environment Variable:**
   ```
   VITE_API_BASE_URL=https://humorous-amazement-production-7ced.up.railway.app
   ```

2. **Update Dockerfile Build Args:**
   Make sure your frontend deployment passes the API URL as a build argument.

### Alternative Quick Fix for Frontend:

If you can't easily update the build process, you can hardcode the production API URL:

**Update `frontend/src/api.js`:**
```javascript
const API = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 
    "https://humorous-amazement-production-7ced.up.railway.app" : 
    "http://localhost:3000");
```

## Testing the Fix

1. **Test API Endpoint:**
   ```bash
   curl https://humorous-amazement-production-7ced.up.railway.app/
   ```

2. **Test Import Endpoint:**
   ```bash
   curl -X POST https://humorous-amazement-production-7ced.up.railway.app/import/google-drive \
     -H "Content-Type: application/json" \
     -d '{"folderUrl": "https://drive.google.com/drive/folders/VALID_FOLDER_ID"}'
   ```

3. **Check Frontend Console:**
   Open browser dev tools and check for any CORS or network errors.

## Common Issues to Check

1. **CORS Configuration**: Backend allows your frontend domain
2. **Environment Variables**: All required vars are set in Railway
3. **Database Connection**: PostgreSQL is properly connected
4. **Redis Connection**: Redis is accessible for job queuing
5. **AWS Credentials**: S3 bucket is accessible with provided credentials
6. **Google API Key**: Has proper permissions for Drive API

## Redeploy Order

1. Deploy backend services first (API Gateway & Worker)
2. Verify backend is working with curl tests
3. Deploy frontend with correct API URL
4. Test end-to-end functionality