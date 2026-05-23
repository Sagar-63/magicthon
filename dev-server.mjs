/**
 * Local API dev server.
 *
 * Runs the /api/*.js Vercel-style handlers behind a plain Node HTTP server,
 * so you can develop without the Vercel CLI. In production, Vercel itself
 * runs these same files as serverless functions — no code changes needed.
 *
 * Listens on http://localhost:3001. Vite (running on :5173) proxies /api
 * requests here via vite.config.js.
 */

import http from 'node:http'
import { URL } from 'node:url'

const PORT = 3001

// Dynamically import handlers so changes pick up on --watch restart.
const handlers = {
  suggest:      (await import('./api/suggest.js')).default,
  memes:        (await import('./api/memes.js')).default,
  memeById:     (await import('./api/memes/[id].js')).default,
  reactToMeme:  (await import('./api/memes/[id]/react.js')).default,
}

function matchRoute(method, pathname) {
  if (method === 'POST' && pathname === '/api/suggest') {
    return { handler: handlers.suggest, params: {} }
  }
  if (method === 'POST' && pathname === '/api/memes') {
    return { handler: handlers.memes, params: {} }
  }
  let m = pathname.match(/^\/api\/memes\/([^/]+)\/react$/)
  if (m && method === 'POST') {
    return { handler: handlers.reactToMeme, params: { id: m[1] } }
  }
  m = pathname.match(/^\/api\/memes\/([^/]+)$/)
  if (m && method === 'GET') {
    return { handler: handlers.memeById, params: { id: m[1] } }
  }
  return null
}

function decorateResponse(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
    return res
  }
  return res
}

const server = http.createServer(async (req, res) => {
  const started = Date.now()
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`)
  const pathname = parsedUrl.pathname

  // Allow simple CORS for testing from a separate frontend dev port if needed.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  const match = matchRoute(req.method, pathname)
  decorateResponse(res)

  if (!match) {
    res.status(404).json({ error: 'route not found', path: pathname })
    console.log(`  404  ${req.method} ${pathname}`)
    return
  }

  // Attach query params (Vercel passes :id via req.query)
  req.query = {
    ...Object.fromEntries(parsedUrl.searchParams.entries()),
    ...match.params,
  }

  try {
    await match.handler(req, res)
  } catch (err) {
    console.error(`  500  ${req.method} ${pathname}:`, err)
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'handler error' })
    }
  } finally {
    const ms = Date.now() - started
    console.log(`  ${res.statusCode}  ${req.method} ${pathname}  ${ms}ms`)
  }
})

server.listen(PORT, () => {
  console.log(`[magicthon api] dev server  ─ http://localhost:${PORT}`)
  console.log(`[magicthon api] routes:`)
  console.log(`    POST  /api/suggest`)
  console.log(`    POST  /api/memes`)
  console.log(`    GET   /api/memes/:id`)
  console.log(`    POST  /api/memes/:id/react`)
})
