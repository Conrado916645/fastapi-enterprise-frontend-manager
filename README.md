# FastAPI Enterprise — Frontend Manager

Admin console for [fastapi-enterprise-core](https://github.com/Conrado916645/fastapi-enterprise-core): users, groups (roles), permissions, MFA, and system settings.

Built with React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7 and axios.

## Quick Start

```bash
npm install
cp .env.example .env    # point VITE_API_BASE_URL at your backend
npm run dev             # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Docker

Production image — a static build served by nginx (non-root, port 8080, gzip, long-cache hashed assets, SPA route fallback, `/healthz` probe):

```bash
docker build --build-arg VITE_API_BASE_URL=https://api.example.com/api/v1 -t frontend .
docker run -p 8080:8080 frontend
```

`VITE_API_BASE_URL` is baked in at **build** time (that's how Vite works), so rebuild the image to point it at a different backend. Local `.env` files are excluded from the image.

Development image with hot reload:

```bash
docker build --target dev -t frontend-dev .
docker run -p 5173:5173 -v "$PWD/src:/app/src" frontend-dev
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api/v1` | Backend API base URL (include `/api/v1`) |

The backend must allow this app's origin under **Settings → General → Frontend Domain(s)** (or via `DOMAIN` in the backend `.env`).

## Project Layout

```
src/
  api/          client.ts (axios: auth header, silent token refresh, error flattening)
                services.ts (one object per backend area) · urls.ts (every endpoint)
  context/      AuthContext — current user, hasPermission(), app name
  components/   RequireAuth / RequirePermission route guards, modals, captcha widgets
  layouts/      DashboardLayout — sidebar + page outlet
  pages/        one file per route; Settings/ holds the settings tabs
```

## How Auth Works

- Login stores an access + refresh token in `localStorage`. On a 401 the axios interceptor refreshes once (queuing concurrent requests) and retries; if refresh fails, the user is sent to `/login`.
- Changing a password revokes all earlier tokens server-side; the change-password response carries a fresh pair, which the modal stores.
- A 403 `PASSWORD_CHANGE_REQUIRED` opens the global change-password modal; a network failure shows the "backend offline" screen.

## Adding a Page

1. Add its endpoints to `src/api/urls.ts` and a service object in `src/api/services.ts`.
2. Create the page in `src/pages/` and add a lazy route in `App.tsx`, wrapped in `<RequirePermission module="..." action="...">`.
3. Add a sidebar entry in `src/layouts/DashboardLayout.tsx` gated by the same `hasPermission(...)` check.
