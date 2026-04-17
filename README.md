# Daily Games Hub

This repository currently contains:

- A React + Vite frontend in `frontend/` using TypeScript
- An Express backend in `backend/` using TypeScript

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

Install dependencies in each package:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Run in Development

Run the backend (port 3000):

```bash
cd backend
npm run dev
```

Run the frontend (port 5173):

```bash
cd frontend
npm run dev
```

Frontend dev server: http://localhost:5173
Backend dev server: http://localhost:3000

## Frontend Scripts

Run these from `frontend/`:

- `npm run dev` - start Vite dev server
- `npm run build` - build production assets to `frontend/dist/`
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Backend Scripts

Run these from `backend/`:

- `npm run dev` - run the TypeScript backend with file watching via `tsx`
- `npm run build` - compile TypeScript to `backend/dist/`
- `npm start` - run the compiled server from `dist/index.js`

The backend exposes:

- `GET /api/health` - health check endpoint

- `backend/.env.example` includes `MONGO_URI`

Optional environment variable:

- `PORT` (defaults to `3000`)

## API Proxy (Frontend)

The frontend Vite config proxies API calls from `/api` to `http://localhost:3000` during development.
