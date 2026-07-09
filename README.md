# NOISECLEANER

NOISECLEANER is a web text-cleaning application for NLP pipelines. The project is organized as a production-ready monorepo with a Vercel frontend and a Render backend.

## Architecture

```text
frontend/   React, Vite, Firebase Authentication, UI, and API calls
backend/    Express gateway, FastAPI internal service, Python models, Docker, and Render config
```

The browser calls the public Express gateway at `POST /api/clean`. Express forwards Linear SVM and Logistic Regression requests to the internal FastAPI service on `127.0.0.1:8000`. FastAPI is not exposed publicly. Gemini requests are handled by the Express gateway when `GEMINI_API_KEY` is configured.

## Local Development

Start the backend:

```bash
cd backend
npm install
pip install -r requirements.txt
npm run dev:all
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Set `frontend/.env` from `frontend/.env.example`:

```bash
VITE_API_URL=http://localhost:3000
```

## Build Commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Docker backend:

```bash
cd backend
docker build -t noisecleaner-backend .
```

## Environment Variables

Frontend:

```text
VITE_API_URL=Public Express backend URL
```

Backend:

```text
PORT=Express port, set automatically by Render
PYTHON_API_URL=Internal FastAPI URL, default http://127.0.0.1:8000
GEMINI_API_KEY=Optional Gemini API key
CORS_ORIGIN=Allowed frontend origin, for example your Vercel URL
```

## Frontend Deployment

Deploy `frontend/` to Vercel.

Set these Vercel settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Environment Variable: VITE_API_URL=https://your-render-service.onrender.com
```

## Backend Deployment

Deploy `backend/` to Render as a Docker Web Service.

Set these Render settings:

```text
Root Directory: backend
Runtime: Docker
Health Check Path: /health
```

Set `GEMINI_API_KEY` only if Gemini support is needed. Set `CORS_ORIGIN` to the deployed Vercel URL.
