# SMRUTI Deployment Guide (Vercel + Render)

## 📁 Repository Structure
```text
smruti/
├── smruti-frontend/   --> Deploy on VERCEL (Frontend)
└── smruti-backend/    --> Deploy on RENDER (Backend)
```

---

## 1. 🚀 Backend Deployment on Render (`smruti-backend/`)

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/ajkismruti01/SMRUTI`.
3. Configure the service:
   - **Root Directory**: `smruti-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add **Environment Variables** in Render (from your `smruti-backend/.env`):
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `FRONTEND_URL`: `https://<your-vercel-frontend-url>`
   - `SESSION_SECRET`: `<your_session_secret>`
   - `MONGODB_URI`: `<your_mongodb_connection_uri>`
   - `GOOGLE_CLIENT_ID`: `<your_google_client_id>`
   - `GOOGLE_CLIENT_SECRET`: `<your_google_client_secret>`
   - `GOOGLE_CALLBACK_URL`: `https://<your-render-backend-url>/api/auth/google/callback`
   - `CLOUDINARY_CLOUD_NAME`: `<your_cloudinary_name>`
   - `CLOUDINARY_API_KEY`: `<your_cloudinary_key>`
   - `CLOUDINARY_API_SECRET`: `<your_cloudinary_secret>`
   - `CLOUDINARY_URL`: `<your_cloudinary_url>`

---

## 2. ⚡ Frontend Deployment on Vercel (`smruti-frontend/`)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your repository: `ajkismruti01/SMRUTI`.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `smruti-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables** in Vercel:
   - `VITE_API_URL`: `https://<your-render-backend-url>/api`
5. Click **Deploy**.

---

## 3. 🔑 Google Cloud Console Configuration
In [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials):
- **Authorized JavaScript Origins**:
  - `https://<your-vercel-frontend-url>`
  - `https://<your-render-backend-url>`
- **Authorized Redirect URIs**:
  - `https://<your-render-backend-url>/api/auth/google/callback`
