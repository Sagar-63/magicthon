/**
 * GET /api/memes/:id
 *
 * Response: { id, imageUrl, width, height, templateId, createdAt, reactions: {emoji: count} }
 */

import { getSql } from '../_lib/services.js'
import { mode } from '../_lib/env.js'
import { memStore } from '../_lib/memstore.js'
import { methodNotAllowed, serverError } from '../_lib/http.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const { id } = req.query
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'missing id', code: 'BAD_REQUEST' })
  }

  if (mode.db === 'mock') {
    const meme = memStore.getMeme(id)
    if (!meme) return res.status(404).json({ error: 'not found', code: 'NOT_FOUND' })
    return res.status(200).json({
      id: meme.id,
      imageUrl: meme.image_url,
      width: meme.width,
      height: meme.height,
      templateId: meme.template_id,
      createdAt: meme.created_at,
      reactions: memStore.getReactionCounts(id),
      meta: { db: 'mock' },
    })
  }

  try {
    const sql = getSql()
    const rows = await sql`
      select id, image_url, width, height, template_id, created_at
      from memes where id = ${id} limit 1
    `
    if (rows.length === 0) {
      return res.status(404).json({ error: 'not found', code: 'NOT_FOUND' })
    }
    const meme = rows[0]

    const counts = await sql`
      select emoji, count(*)::int as c
      from reactions where meme_id = ${id}
      group by emoji
    `
    const reactions = Object.fromEntries(counts.map((r) => [r.emoji, r.c]))

    return res.status(200).json({
      id: meme.id,
      imageUrl: meme.image_url,
      width: meme.width,
      height: meme.height,
      templateId: meme.template_id,
      createdAt: meme.created_at,
      reactions,
      meta: { db: 'real' },
    })
  } catch (err) {
    return serverError(res, err)
  }
}
