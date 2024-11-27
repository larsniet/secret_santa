# Secret Santa App Deployment Guide

## Project Structure

```
secret_santa/
├── backend/         # Express.js backend
├── frontend/        # React frontend
└── README.md       # This file
```

## Deployment Steps

### 1. Backend Deployment (Render.com)

1. Go to [Render.com](https://render.com) and create an account
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the Web Service:
   - Name: `secret-santa-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Root Directory: `backend`
5. Add Environment Variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5001
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=your_email
   SMTP_PASS=your_password
   SMTP_FROM="Father Christmas <your_email>"
   ```
6. Click "Create Web Service"

### 2. Frontend Deployment (Render.com)

1. In Render.com, click "New +" and select "Static Site"
2. Connect your GitHub repository
3. Configure the Static Site:
   - Name: `secret-santa-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
   - Root Directory: `frontend`
4. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   REACT_APP_ADMIN_PASSWORD=your_admin_password
   ```
5. Click "Create Static Site"

### 3. Update Frontend API URL

After both services are deployed:

1. Get your backend URL from Render.com
2. Update the `REACT_APP_API_URL` in the frontend's environment variables on Render.com
3. Trigger a new deployment of the frontend

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Environment Variables

### Backend (.env)

```
MONGODB_URI=your_mongodb_connection_string
PORT=5001
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM="Father Christmas <your_email>"
```

### Frontend (.env.production)

```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
REACT_APP_ADMIN_PASSWORD=your_admin_password
```

## Important Notes

1. Make sure to update the CORS settings in the backend if needed
2. Keep your admin password secure
3. Never commit sensitive environment variables to Git
4. MongoDB connection string should be from your MongoDB Atlas cluster
