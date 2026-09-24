# Deployment Guide for Render

This guide outlines the step-by-step instructions to deploy the **Task Management App** (Django Backend + React Frontend) on [Render](https://render.com).

---

## Architecture Overview

- **Backend**: Python Web Service running Django with `gunicorn` and `whitenoise` (handles static files automatically).
- **Frontend**: Render Static Site running the React/Vite production build.
- **Database**: PostgreSQL (Neon, Render PostgreSQL, Supabase, or AWS RDS).

---

## Method 1: Deploy with Render Blueprint (`render.yaml`) (Recommended)

Render Blueprints allow you to provision and configure both services in a single workflow.

### Steps:
1. **Push your code to GitHub / GitLab**:
   Ensure all changes are committed and pushed to your repository.

2. **Log into Render**:
   Go to [dashboard.render.com](https://dashboard.render.com).

3. **Create a New Blueprint**:
   - Click **New +** > **Blueprint**.
   - Connect your GitHub repository.
   - Render will detect the `render.yaml` file in the root directory.

4. **Configure Environment Variables**:
   Render will prompt you for any un-synced variables:
   - `DATABASE_URL`: Paste your PostgreSQL connection URL (e.g. from your Neon DB or Render PostgreSQL).
   - `VITE_API_BASE_URL`: Set this to `https://<your-backend-name>.onrender.com/api` (you can update this once the backend service URL is created).

5. **Deploy**:
   - Click **Apply**. Render will automatically build the backend, apply database migrations, collect static files, and compile the frontend.

---

## Method 2: Manual Deployment via Render Dashboard

If you prefer configuring each service individually in the Render Dashboard:

### Step 1: Deploy the Backend (Web Service)

1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `taskmanagement-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `bash ./build.sh`
   - **Start Command**: `gunicorn --chdir TaskManagement TaskManagement.wsgi:application`
   - **Plan**: `Free`
4. Expand **Advanced** > **Environment Variables** and add:
   - `PYTHON_VERSION`: `3.12.8`
   - `DEBUG`: `False`
   - `SECRET_KEY`: Generate a random secure key (Render has a "Generate" button)
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `ALLOWED_HOSTS`: `.onrender.com,localhost,127.0.0.1`
   - `CSRF_TRUSTED_ORIGINS`: `https://*.onrender.com,http://localhost:5173`
   - `CORS_ALLOWED_ORIGINS`: Your frontend URL once deployed (e.g., `https://taskmanagement-frontend.onrender.com`)
5. Click **Create Web Service**.
6. Wait for the build to finish. Once live, note your backend URL (e.g., `https://taskmanagement-backend.onrender.com`).
   - You can test it by visiting: `https://taskmanagement-backend.onrender.com/api/health/`

---

### Step 2: Deploy the Frontend (Static Site)

1. Click **New +** > **Static Site**.
2. Connect the same repository.
3. Configure the settings:
   - **Name**: `taskmanagement-frontend` (or your choice)
   - **Root Directory**: `frontend/TaskManagementApp`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://<your-backend-name>.onrender.com/api`
   *(Replace `<your-backend-name>` with your actual backend URL from Step 1)*
5. Configure **Redirects / Rewrites** (Crucial for React Router SPA):
   - Under the **Redirects / Rewrites** tab:
     - **Action**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(Note: If you used `render.yaml`, this rule is configured automatically).*
6. Click **Create Static Site**.

---

### Step 3: Link CORS in Backend

Once your frontend has a live Render URL (e.g., `https://taskmanagement-frontend.onrender.com`):
1. Go to your Backend service in Render.
2. Under **Environment**, check `CORS_ALLOWED_ORIGINS` to ensure it includes your frontend URL (the backend already automatically allows any `https://*.onrender.com` domain by default).

---

## Verifying Deployment

1. **Backend Health Check**:
   Visit `https://<your-backend-name>.onrender.com/api/health/`
   Expected response:
   ```json
   {"status": "ok", "service": "Task Management API"}
   ```

2. **Frontend UI**:
   Visit your frontend URL. Test:
   - Register a new account
   - Log in
   - Create, edit, and delete tasks
   - Log out

---

## Note on Free Tier "Spin Down"
Render's free tier spins down web services after 15 minutes of inactivity. When a request comes in, it may take 30-50 seconds to wake up (cold start). Once awake, it responds with normal speed.
