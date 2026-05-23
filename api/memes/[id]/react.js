/**
 * POST /api/memes/:id/react
 *
 * Request:  { emoji: string }
 * Response: { ok: true, emoji, counts: {emoji: count} }
 *
 * Also publishes a `reaction` event on Pusher channel `meme-<id>` so any
 * subscribed clients (creator's tab) see it land in real time.
 */

import { getSql, getPusher } from '../../_lib/services.js'
import { mode } from '../../_lib/env.js'
import { memStore } from '../../_lib/memstore.js'
import { badRequest, methodNotAllowed, readJson, serverError } from '../../_lib/http.js'

const ALLOWED_EMOJIS = ['😂', '💀', '🔥', '😭', '🤯', '❤️']

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const { id } = req.query
  if (!id || typeof id !== 'string') return badRequest(res, 'missing id')

  let body
  try { body = await readJson(req) } catch { return badRequest(res, 'invalid JSON') }

  const { emoji } = body
  if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
    return badRequest(res, 'emoji must be one of the allowed set', { allowed: ALLOWED_EMOJIS })
  }

  let counts

  if (mode.db === 'mock') {
    const row = memStore.addReaction(id, emoji)
    if (!row) return res.status(404).json({ error: 'meme not found', code: 'NOT_FOUND' })
    counts = memStore.getReactionCounts(id)
  } else {
    try {
      const sql = getSql()
      // Ensure the meme exists, otherwise foreign-key insert would fail with a 500
      const exists = await sql`select 1 from memes where id = ${id} limit 1`
      if (exists.length === 0) {
        return res.status(404).json({ error: 'meme not found', code: 'NOT_FOUND' })
      }
      await sql`insert into reactions (meme_id, emoji) values (${id}, ${emoji})`
      const rows = await sql`
        select emoji, count(*)::int as c
        from reactions where meme_id = ${id}
        group by emoji
      `
      counts = Object.fromEntries(rows.map((r) => [r.emoji, r.c]))
    } catch (err) {
      return serverError(res, err)
    }
  }

  // Realtime: broadcast on Pusher
  if (mode.realtime === 'real') {
    try {
      const pusher = getPusher()
      await pusher.trigger(`meme-${id}`, 'reaction', { emoji, counts, at: Date.now() })
    } catch (err) {
      // Realtime failure shouldn't break the write. Log and continue.
      console.warn('[react] pusher trigger failed:', err?.message)
    }
  }

  return res.status(200).json({
    ok: true,
    emoji,
    counts,
    meta: { db: mode.db, realtime: mode.realtime },
  })
}
