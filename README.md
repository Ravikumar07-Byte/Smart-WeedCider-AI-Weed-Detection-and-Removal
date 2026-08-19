# WeedICider

Production-ready React/Vite frontend with same-origin Vercel serverless API routes. A Flask API is also included for Render if you want full YOLO `.pt` inference later.

## Folder Structure

```text
.
├── frontend/          # Vite React app for Vercel
│   ├── public/        # Static images and sample dataset manifest
│   ├── src/           # UI, routing, API client
│   └── package.json
├── api/               # Vercel serverless API routes served at /api/*
├── backend/           # Flask API for Render
│   ├── app.py
│   ├── requirements.txt
│   └── data.yaml
├── vercel.json        # Vercel frontend build config
├── render.yaml        # Render backend blueprint
└── .env.example
```

## Local Development

Backend:

```bash
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Frontend:

```bash
cd frontend
npm ci
VITE_API_BASE_URL=http://127.0.0.1:5004 npm run dev
```

Open the Vite URL, usually `http://127.0.0.1:5173`.

## Production Deployment

Vercel frontend and serverless API:

```bash
git push origin main
```

The deployed app uses same-origin API routes by default, so `VITE_API_BASE_URL` can be left blank.

Current production URL:

```text
https://weedicider.vercel.app
```

Current same-origin backend health endpoint:

```text
https://weedicider.vercel.app/api/backend-status
```

## Optional Render Backend

Render backend:

```bash
git push origin main
```

Create a Render Blueprint from `render.yaml`, or create a Web Service with:

```bash
Root Directory: backend
Build Command: pip install --upgrade pip && pip install -r requirements.txt
Start Command: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 120
Health Check Path: /healthz
```

Render environment variables:

```bash
FLASK_DEBUG=0
DATA_DIR=/tmp/weedicider
MAX_UPLOAD_MB=16
ALLOWED_ORIGINS=*
MODEL_URL=
MODEL_PATH=
```

Vercel frontend with external Render backend:

```bash
git push origin main
```

Import the same repo in Vercel. `vercel.json` runs:

```bash
cd frontend && npm ci
cd frontend && npm run build
```

Only set this Vercel environment variable if you want the frontend to use Render instead of the same-origin Vercel API:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

After both services are live, you can tighten CORS by changing `ALLOWED_ORIGINS` from `*` to the exact Vercel URL.

## Model Deployment Note

The repository ignores `*.pt` files, so Render will not receive local YOLO weights automatically. Set `MODEL_URL` to a hosted `.pt` file to enable real YOLO inference. If no model is available, the API remains online in deterministic demo mode so the deployed app still renders and all routes work.
