/** Tiny HTTP helpers for Vercel-style serverless handlers. */

export function methodNotAllowed(res, allowed = []) {
  res.setHeader('Allow', allowed.join(', '))
  return res.status(405).json({ error: 'method not allowed', code: 'METHOD_NOT_ALLOWED' })
}

export function badRequest(res, message, details) {
  return res.status(400).json({ error: message, code: 'BAD_REQUEST', details })
}

export function serverError(res, err) {
  console.error('[api] server error:', err)
  return res
    .status(500)
    .json({ error: err?.message || 'server error', code: err?.code || 'SERVER_ERROR' })
}

/** Read JSON body from a Vercel/Express request. */
export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return await new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}) } catch (e) { reject(e) }
    })
    req.on('error', reject)
  })
}
