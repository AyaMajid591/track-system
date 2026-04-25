# TRACK Deployment Guide

This project is set up for:

- frontend on Vercel
- backend on Render
- PostgreSQL on Neon

The UI and app behavior stay the same. Secrets are not stored in the repo. Local `.env` files should stay uncommitted.

## Project Structure

- frontend: repo root
- backend: `backend/backend`

## Environment Files

Use the example files as templates:

- frontend example: `.env.example`
- backend example: `backend/backend/.env.example`

Do not commit real `.env` files.

## Local Development

Frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:5050
REACT_APP_API_FALLBACK_URL=
```

Backend `backend/backend/.env`:

```env
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_URL=
DB_USER=postgres
DB_HOST=localhost
DB_NAME=track_app
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=change_me
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
DEMO_USER_EMAIL=finance.demo@track.local
DEMO_USER_PASSWORD=TrackDemo!2026
DEMO_USER_NAME=Demo User
```

Run locally:

```bash
brew services start postgresql@14
cd backend/backend && npm start
cd ../.. && npm start
```

## Deployment Overview

You will create:

1. a Neon Postgres database
2. a Render web service for the backend
3. a Vercel project for the frontend

Deploy in that order.

## 1. Create Neon PostgreSQL

1. Sign in to Neon.
2. Create a new project.
3. Create or keep the default database.
4. Copy the connection string that looks like:

```txt
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

5. Keep this value for Render as `DATABASE_URL`.

Notes:

- Neon requires SSL. The backend is already configured for that.
- Do not paste this connection string into source code.

## 2. Deploy Backend to Render

### Option A: Use `render.yaml`

The repo already includes `render.yaml`.

In Render:

1. Create a new Blueprint or Web Service from your GitHub repo.
2. If using Blueprint, Render will detect `render.yaml`.
3. Confirm the service root directory is `backend/backend`.

### Option B: Manual Render Setup

Use these values:

- Runtime: `Node`
- Root Directory: `backend/backend`
- Build Command: `npm install`
- Start Command: `npm start`

### Render Environment Variables

Add these in Render:

```env
NODE_ENV=production
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
DATABASE_URL=your_neon_connection_string
JWT_SECRET=use_a_long_random_secret
OPENAI_API_KEY=optional
OPENAI_MODEL=gpt-4.1-mini
DEMO_USER_EMAIL=finance.demo@track.local
DEMO_USER_PASSWORD=TrackDemo!2026
DEMO_USER_NAME=Demo User
```

Important:

- Replace `FRONTEND_URL` with the real Vercel URL after frontend deployment.
- If you later add a custom domain, update `FRONTEND_URL` again.
- `JWT_SECRET` must be your own strong secret.

### Verify Backend

After deploy, open:

```txt
https://your-render-service.onrender.com/
```

It should return:

```json
{"message":"TRACK backend is running"}
```

Save the backend URL. You will use it in Vercel as `REACT_APP_API_URL`.

## 3. Deploy Frontend to Vercel

In Vercel:

1. Import the GitHub repository.
2. Keep the project root at the repository root.
3. Use the default Create React App build settings:

- Build Command: `npm run build`
- Output Directory: `build`

### Vercel Environment Variables

Add:

```env
REACT_APP_API_URL=https://your-render-service.onrender.com
REACT_APP_API_FALLBACK_URL=
```

Notes:

- The frontend already reads the API base URL from env vars.
- Do not hardcode the backend URL in source files.
- A `vercel.json` rewrite is included so React Router routes work after refresh.

### Redeploy After Setting Env Vars

If you add or change env vars, redeploy the Vercel project so the production build picks them up.

## 4. Connect Frontend URL Back to Render

Once Vercel gives you a URL like:

```txt
https://track-system.vercel.app
```

go back to Render and set:

```env
FRONTEND_URL=https://track-system.vercel.app
```

Then redeploy the backend.

This is required because backend CORS now allows your production frontend URL from environment variables.

## 5. End-to-End Check

After both deployments are live:

1. Open the Vercel frontend URL.
2. Register a new account.
3. Log in.
4. Open the dashboard.
5. Confirm transactions, accounts, and budgets load.
6. Open AI Assistant and verify the backend request works.

## PWA in Production

PWA install works only on the deployed frontend or other production builds, not only on local dev mode.

To test installability:

1. open the Vercel frontend URL in Chrome
2. log in
3. refresh once
4. click `Install TRACK` or use Chrome's install prompt

## Files Added or Updated for Deployment

- frontend env template: `.env.example`
- backend env template: `backend/backend/.env.example`
- Vercel SPA rewrite: `vercel.json`
- Render service blueprint: `render.yaml`
- frontend API config: `src/authService.js`
- backend DB config: `backend/backend/db.js`
- backend CORS config: `backend/backend/server.js`

## Production Notes

- Never commit `.env` files with real secrets.
- Neon connection strings belong only in Render environment variables.
- Vercel should only receive frontend-safe env vars prefixed with `REACT_APP_`.
- Render should hold server secrets such as `DATABASE_URL`, `JWT_SECRET`, and `OPENAI_API_KEY`.
