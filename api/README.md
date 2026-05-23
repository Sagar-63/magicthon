# Magicthon API

Vercel-style serverless functions. Every endpoint runs in "mock mode" when its
backing service's env vars are missing, so you can develop locally without
signing up for anything, then activate services one at a time.

## Endpoints

| Method | Path                          | Purpose                                    |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/api/suggest`                | Claude vision → 6 meme captions            |
| POST   | `/api/memes`                  | Save a finished meme (PNG + metadata)      |
| GET    | `/api/memes/:id`              | Fetch a meme + its reaction counts         |
| POST   | `/api/memes/:id/react`        | Add a reaction (+ broadcast via Pusher)    |

## Mock mode

| Service     | Env vars                                                                  | Mock behavior                                                            |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Claude      | `ANTHROPIC_API_KEY`                                                       | `/api/suggest` returns the canned 6-suggestion list from `_lib/prompt.js`|
| Cloudinary  | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`    | `/api/memes` returns the data URL as the imageUrl (browser-only)         |
| Neon        | `DATABASE_URL`                                                            | Memes + reactions stored in an in-process Map (lost on restart)          |
| Pusher      | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`         | Reactions still persisted, but no live broadcast                         |

## Running locally

You need Vercel's CLI to run the functions on your machine:

```bash
npm i -g vercel
vercel dev
```

This starts both the Vite frontend and the `/api` functions on the same port.

## Schema

When you wire Neon, run `_schema.sql` once in the Neon SQL editor.
