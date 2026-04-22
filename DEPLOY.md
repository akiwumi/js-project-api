# Deployment Guide

This repo is prepared for:

- **Frontend** on Vercel
- **Backend** on Render
- **Database** on MongoDB Atlas

## 1. Backend on Render

### Option A: Blueprint via `render.yaml`

1. Connect the repo to Render.
2. Create a new **Blueprint** service.
3. Render will use `render.yaml` with:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`

Set these environment variables in Render:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
CLIENT_URLS=https://your-frontend.vercel.app
NODE_ENV=production
```

If you add a custom frontend domain later, append it:

```env
CLIENT_URLS=https://your-frontend.vercel.app,https://chat.yourdomain.com
```

### Option B: Manual Render Web Service

Use these settings:

- Runtime: `Node`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Environment variables:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-long-random-secret
CLIENT_URLS=https://your-frontend.vercel.app
NODE_ENV=production
```

Notes:

- In production the backend **fails fast** if MongoDB is not reachable.
- Local in-memory fallback is only enabled outside production unless `ALLOW_MEMORY_FALLBACK=true`.

## 2. Frontend on Vercel

1. Import the repo into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Keep the detected Vite build settings.
4. Add these environment variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com
VITE_SOCKET_URL=https://your-render-backend.onrender.com
```

5. Deploy.

Notes:

- If the frontend and backend live on different origins, keep both `VITE_API_URL` and `VITE_SOCKET_URL` set in Vercel.
- If those vars are left unset, the frontend falls back to same-origin `/api` and `socket.io`, which is useful for proxied local development but not for a split Vercel + Render setup.

## 3. MongoDB Atlas

Use your Atlas connection string for `MONGODB_URI`.

If Atlas network access is locked down, allow the Render service to connect. For a beginner setup, many people start with Atlas IP access open to all addresses and tighten it later.

## 4. What to test after deploy

1. Open the Render backend URL and confirm `/health` returns JSON.
2. Open the Vercel frontend URL.
3. Log in with a test user or register a new user.
4. Send a message and confirm Socket.IO connects.

## 5. Handy files

- Backend env example: `backend/.env.example`
- Frontend env example: `frontend/.env.example`
- Render blueprint: `render.yaml`
- Backend server config: `backend/server.js`
