/**
 * POST /api/memes
 *
 * Request:  { dataUrl: string, width?: int, height?: int, templateId?: string, layers?: any }
 * Response: { id, imageUrl, createdAt, meta: { storage, db } }
 *
 * Behavior:
 *  - storage=real: uploads PNG to Cloudinary, gets a public URL
 *    storage=mock: the data URL is returned as the imageUrl (works in-browser only)
 *  - db=real:      inserts a row into Neon Postgres
 *    db=mock:      stores in in-memory dev store (memstore.js)
 */

import { getCloudinary, getSql } from './_lib/services.js'
import { mode } from './_lib/env.js'
import { generateId } from './_lib/id.js'
import { memStore } from './_lib/memstore.js'
import { badRequest, methodNotAllowed, readJson, serverError } from './_lib/http.js'

export const config = { maxDuration: 30 }

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  let body
  try { body = await readJson(req) } catch { return badRequest(res, 'invalid JSON') }

  const { dataUrl, width, height, templateId, layers } = body
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return badRequest(res, 'dataUrl (data:image/...) is required')
  }

  const id = generateId()

  // ─── Storage: upload PNG to Cloudinary, or keep dataUrl in mock mode ──
  let imageUrl
  if (mode.storage === 'real') {
    try {
      const cloudinary = getCloudinary()
      const result = await cloudinary.uploader.upload(dataUrl, {
        public_id: `magicthon/${id}`,
        resource_type: 'image',
        overwrite: false,
      })
      imageUrl = result.secure_url
    } catch (err) {
      return serverError(res, err)
    }
  } else {
    imageUrl = dataUrl // works only in-browser, but fine for local preview
  }

  // ─── DB: insert into Neon, or stash in in-memory dev store ───────────
  const row = {
    id,
    image_url: imageUrl,
    width: Number.isFinite(width) ? Math.round(width) : null,
    height: Number.isFinite(height) ? Math.round(height) : null,
    template_id: typeof templateId === 'string' ? templateId : null,
    layers: layers && typeof layers === 'object' ? layers : null,
    created_at: new Date().toISOString(),
  }

  if (mode.db === 'real') {
    try {
      const sql = getSql()
      await sql`
        insert into memes (id, image_url, width, height, template_id, layers)
        values (${row.id}, ${row.image_url}, ${row.width}, ${row.height}, ${row.template_id}, ${row.layers ? JSON.stringify(row.layers) : null})
      `
    } catch (err) {
      return serverError(res, err)
    }
  } else {
    memStore.saveMeme(row)
  }

  return res.status(200).json({
    id,
    imageUrl,
    createdAt: row.created_at,
    meta: { storage: mode.storage, db: mode.db },
  })
}
