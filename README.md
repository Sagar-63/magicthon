# Magicthon

Upload a photo, get six AI-generated meme directions, refine in a canvas editor,
and share a live link with realtime reactions.

Built with React + Vite on the frontend and Vercel-style serverless functions
(`/api/*.js`) on the backend. Every backing service has a **mock mode**, so you
can fork, clone, and run the entire app locally without signing up for anything.
Add real keys later, one service at a time.

---

## Prerequisites

- **Node.js 20.6+** (the dev API server uses Node's built-in `--env-file` flag)
- **npm** (ships with Node)
- **git**

Check your versions:

```bash
node --version   # should be ≥ 20.6
npm --version
```

---

## 1. Fork and clone

1. Click **Fork** on the GitHub repo to create your own copy.
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-username>/magicthon.git
   cd magicthon
   ```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Set up environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

`.env.local` is gitignored. You can leave **every value blank** for now — each
endpoint falls back to mock mode when its keys are missing.

When you run the API, it logs which services are real vs mocked, e.g.:

```
[magicthon api] mode: {"claude":"mock","storage":"mock","db":"mock","realtime":"mock"}
```

See [Wiring real services](#wiring-real-services-optional) below to swap mocks
for live integrations.

---

## 4. Run the app

```bash
npm run dev
```

This starts two processes in parallel:

| Process | Port | What it does                                    |
| ------- | ---- | ----------------------------------------------- |
| Vite    | 5173 | React frontend with HMR                         |
| API     | 3001 | Node HTTP server running the `/api/*.js` files  |

Vite proxies `/api/*` requests to port 3001, so you only need to open:

**http://localhost:5173**

---

## Wiring real services (optional)

Each service is independent — wire as many or as few as you like. Add the keys
to `.env.local` and restart `npm run dev`.

### Claude (caption generation)

Without a key, `/api/suggest` returns a canned 6-suggestion list.

1. Get an API key at <https://console.anthropic.com/>.
2. Set `ANTHROPIC_API_KEY` in `.env.local`.

### Cloudinary (image storage)

Without keys, the API returns the raw data URL as the image URL — works in your
own browser, but the share link won't render anywhere else.

1. Sign up at <https://cloudinary.com/console>.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Neon (Postgres)

Without `DATABASE_URL`, memes and reactions live in an in-process `Map` and are
lost on every restart.

1. Create a project at <https://console.neon.tech/> and copy the connection string.
2. Set `DATABASE_URL` in `.env.local`.
3. Run the schema once in the Neon SQL editor:

   ```bash
   cat api/_schema.sql
   ```

### Pusher (realtime reactions)

Without Pusher keys, reactions still persist but the share page won't update
live for other viewers.

1. Create an app at <https://dashboard.pusher.com/>.
2. Set the server keys: `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`.
3. Set the public keys that Vite injects into the frontend:
   `VITE_PUSHER_KEY`, `VITE_PUSHER_CLUSTER`.

---

## Other commands

```bash
npm run build      # production bundle into dist/
npm run preview    # serve the built bundle locally
npm run lint       # ESLint
```

---

## Project layout

```
src/                React app (pages, components, lib)
api/                Serverless functions (also runnable locally)
  _lib/             Shared helpers (env, services, prompt)
  _schema.sql       Neon Postgres schema
dev-server.mjs      Local Node server that runs api/*.js on port 3001
vite.config.js      Vite config + /api proxy to port 3001
```

For more on the API surface and mock-mode behavior per service, see
[`api/README.md`](api/README.md).
