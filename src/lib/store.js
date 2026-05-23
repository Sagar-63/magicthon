/**
 * Meme store — talks to /api/memes via the backend.
 *
 * Same function names as the old localStorage stub; callers now await them.
 * Same-browser cross-tab updates still piggyback on BroadcastChannel; live
 * cross-device updates come from Pusher once that's wired.
 */

const CHANNEL_NAME = 'magicthon:reactions'

export const REACTION_EMOJIS = ['😂', '💀', '🔥', '😭', '🤯', '❤️']

const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

function emptyReactions() {
  return Object.fromEntries(REACTION_EMOJIS.map((e) => [e, 0]))
}

/**
 * POST the finished meme to the server.
 * Input: { dataUrl, width, height, templateId, layers }
 * Returns: { id, imageUrl, createdAt }
 */
export async function saveMeme(meme) {
  const res = await fetch('/api/memes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dataUrl: meme.dataUrl,
      width: meme.width,
      height: meme.height,
      templateId: meme.templateId,
      layers: meme.layers,
    }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `save failed (${res.status})`)
  }
  return res.json()
}

/** GET a meme by id. Returns null on 404. */
export async function getMeme(id) {
  if (!id) return null
  const res = await fetch(`/api/memes/${encodeURIComponent(id)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`fetch failed (${res.status})`)
  const data = await res.json()
  return {
    ...data,
    reactions: { ...emptyReactions(), ...(data.reactions || {}) },
  }
}

/**
 * POST a reaction. Returns the fresh counts ({emoji: count}) or null if the
 * meme doesn't exist. Also broadcasts to same-browser tabs.
 */
export async function reactToMeme(id, emoji) {
  const res = await fetch(`/api/memes/${encodeURIComponent(id)}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji }),
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `react failed (${res.status})`)
  }
  const data = await res.json()
  const counts = { ...emptyReactions(), ...(data.counts || {}) }
  channel?.postMessage({ type: 'react', id, emoji, counts, at: Date.now() })
  return counts
}

/**
 * Subscribe to live reaction events for a meme (same browser, cross-tab).
 * cb is called with { emoji, counts, at }.
 */
export function subscribeToReactions(id, cb) {
  if (!channel) return () => {}
  const onMessage = (e) => {
    if (e.data?.type === 'react' && e.data.id === id) {
      cb({ emoji: e.data.emoji, counts: e.data.counts, at: e.data.at })
    }
  }
  channel.addEventListener('message', onMessage)
  return () => channel.removeEventListener('message', onMessage)
}

export function buildShareUrl(id) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/m/${id}`
}

export function parseRoute() {
  const m = window.location.hash.match(/^#\/m\/([a-z0-9]+)/i)
  return m ? { type: 'recipient', id: m[1] } : { type: 'app' }
}
