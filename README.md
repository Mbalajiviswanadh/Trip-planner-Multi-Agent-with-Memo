# Trip planner

React + Vite + Redux Toolkit + Tailwind CSS + Framer Motion client for the TripMate AI FastAPI backend.

## Run it

```bash
npm install
cp .env.example .env      # set VITE_API_URL if your API is not on http://localhost:8000
npm run dev               # http://localhost:5173
```

Start the backend first (`uvicorn app:app --reload --port 8000`). The default CORS list in your backend already allows `http://localhost:5173`; for production add your domain to `ALLOWED_ORIGINS`.

## Build and deploy

```bash
npm run build             # outputs dist/
npm run preview           # serve the build locally on :4173
```

Docker (nginx, SPA fallback included):

```bash
docker build --build-arg VITE_API_URL=https://api.yourdomain.com -t tripmate-frontend .
docker run -p 8080:80 tripmate-frontend
```

`VITE_API_URL` is baked in at build time.

## Change the colors

Edit **`src/theme/colors.js`**. It holds one `light` and one `dark` palette; every component reads from it, so nothing else needs to change.

## How it maps to the backend

| UI | Endpoint |
|---|---|
| Register / sign in / restore session | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Chat list (left sidebar) | `GET/POST /api/threads`, `DELETE /api/threads/{id}` |
| Send a message | `POST /api/travel` |
| Approve / request changes on a draft | `POST /api/travel/approve` |
| Reopen a thread with no local cache | `GET /api/history/{thread_id}` |

The JWT is sent as a Bearer token; a 401 from any call signs the user out.

## Structure

```
src/
  theme/       colors.js (edit this), applyTheme.js
  lib/         api.js (fetch client + error normalising), format.js, storage.js
  store/       auth, threads, chat, ui slices
  components/  Sidebar, Message, Composer, ApprovalCard, FlowPanel ...
  pages/       AuthPage, ChatPage
```

## Notes

- Chats are cached in localStorage per user because `/api/history` only returns answers longer than 200 characters, so short chat replies would otherwise be missing after a reload.
- The agent-flow panel shows the agents that ran, LLM calls, total time, the supervisor's reasoning, extracted trip details and the sources/links each agent returned.
