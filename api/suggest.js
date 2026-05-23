/**
 * POST /api/suggest
 *
 * Request (one of):
 *   { imageUrl: string }                                  // public URL Claude fetches
 *   { imageData: base64String, mediaType?: string }       // image bytes inline
 *
 * Response: { suggestions: [{templateId, texts, headline}, ...] }
 *
 * Mode:
 *  - claude=real : calls Claude Sonnet 4.6 vision with forced tool use
 *  - claude=mock : returns canned MOCK_SUGGESTIONS so the frontend works
 *                  without any API keys
 */

import { getAnthropic } from './_lib/services.js'
import { mode } from './_lib/env.js'
import {
  SYSTEM_PROMPT,
  USER_PROMPT,
  SUGGESTION_TOOL,
  MOCK_SUGGESTIONS,
} from './_lib/prompt.js'
import { badRequest, methodNotAllowed, readJson, serverError } from './_lib/http.js'

export const config = { maxDuration: 30 } // Claude vision can take up to ~15s

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  let body
  try { body = await readJson(req) } catch { return badRequest(res, 'invalid JSON') }

  const { imageUrl, imageData, mediaType } = body
  if (!imageUrl && !imageData) {
    return badRequest(res, 'imageUrl OR imageData is required')
  }

  // Build the image content block for Claude
  const imageBlock = imageUrl
    ? { type: 'image', source: { type: 'url', url: imageUrl } }
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType || 'image/jpeg',
          data: imageData,
        },
      }

  // ─── Mock mode ────────────────────────────────────────────────────
  if (mode.claude === 'mock') {
    return res.status(200).json({
      suggestions: MOCK_SUGGESTIONS,
      meta: { mode: 'mock', reason: 'ANTHROPIC_API_KEY not set' },
    })
  }

  // ─── Real Claude vision call ──────────────────────────────────────
  const client = getAnthropic()

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [imageBlock, { type: 'text', text: USER_PROMPT }],
        },
      ],
      tools: [SUGGESTION_TOOL],
      tool_choice: { type: 'tool', name: 'submit_meme_suggestions' },
    })

    const toolUse = response.content.find((b) => b.type === 'tool_use')
    if (!toolUse) {
      console.warn('[suggest] no tool_use in response, returning mock')
      return res.status(200).json({
        suggestions: MOCK_SUGGESTIONS,
        meta: { mode: 'fallback', reason: 'no tool_use block' },
      })
    }

    const raw = toolUse.input?.suggestions || []

    // Defensive: dedupe by templateId and keep first 6
    const seen = new Set()
    const clean = []
    for (const s of raw) {
      if (!s || seen.has(s.templateId)) continue
      if (!s.templateId || !s.texts || !s.headline) continue
      seen.add(s.templateId)
      clean.push(s)
    }

    // Backfill any missing templates from MOCK_SUGGESTIONS so frontend always
    // gets a full set of 6, even if Claude skipped one.
    for (const fallback of MOCK_SUGGESTIONS) {
      if (clean.length >= 6) break
      if (!seen.has(fallback.templateId)) {
        clean.push(fallback)
        seen.add(fallback.templateId)
      }
    }

    return res.status(200).json({
      suggestions: clean,
      meta: { mode: 'real', model: 'claude-sonnet-4-6' },
    })
  } catch (err) {
    if (err?.status === 429) {
      return res
        .status(429)
        .json({ error: 'rate limited, try again', code: 'RATE_LIMIT' })
    }
    if (err?.status >= 400 && err?.status < 500) {
      return res
        .status(err.status)
        .json({ error: err.message, code: 'CLAUDE_BAD_REQUEST' })
    }
    return serverError(res, err)
  }
}
