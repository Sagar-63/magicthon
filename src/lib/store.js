/**
 * Local meme store — pretends to be a backend so we can preview the share-link
 * + live-reactions flow before wiring Supabase.
 *
 * - Persistence: localStorage (per-browser, per-origin)
 * - Live updates between tabs: BroadcastChannel
 *
 * When we swap to Supabase, the function signatures stay the same; only the
 * implementation changes.
 */

const STORAGE_KEY = 'magicthon:memes:v1'
const CHANNEL_NAME = 'magicthon:reactions'

export const REACTION_EMOJIS = ['😂', '💀', '🔥', '😭', '🤯', '❤️']

const channel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.warn('magicthon: storage full?', err)
  }
}

function generateId(len = 6) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let id = ''
  for (let i = 0; i < len; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function emptyReactions() {
  return Object.fromEntries(REACTION_EMOJIS.map((e) => [e, 0]))
}

/** Save a meme and return its id. */
export function saveMeme(meme) {
  const all = loadAll()
  const id = generateId()
  all[id] = {
    id,
    dataUrl: meme.dataUrl,
    width: meme.width,
    height: meme.height,
    templateId: meme.templateId,
    createdAt: Date.now(),
    reactions: emptyReactions(),
  }
  saveAll(all)
  return id
}

/** Return a stored meme or null. */
export function getMeme(id) {
  return loadAll()[id] || null
}

/** Increment a reaction; broadcasts to other tabs. */
export function reactToMeme(id, emoji) {
  const all = loadAll()
  if (!all[id]) return null
  all[id].reactions = all[id].reactions || emptyReactions()
  all[id].reactions[emoji] = (all[id].reactions[emoji] || 0) + 1
  saveAll(all)
  channel?.postMessage({ type: 'react', id, emoji, at: Date.now() })
  return all[id]
}

/**
 * Subscribe to live reaction events for a meme.
 * cb is called with { emoji, at } whenever a reaction lands (in this tab or another).
 * Returns an unsubscribe function.
 */
export function subscribeToReactions(id, cb) {
  if (!channel) return () => {}
  const onMessage = (e) => {
    if (e.data?.type === 'react' && e.data.id === id) {
      cb({ emoji: e.data.emoji, at: e.data.at })
    }
  }
  channel.addEventListener('message', onMessage)
  return () => channel.removeEventListener('message', onMessage)
}

/** Build the public URL for a meme id. */
export function buildShareUrl(id) {
  const { origin, pathname } = window.location
  return `${origin}${pathname}#/m/${id}`
}

/** Parse the current URL into a route object. */
export function parseRoute() {
  const m = window.location.hash.match(/^#\/m\/([a-z0-9]+)/i)
  return m ? { type: 'recipient', id: m[1] } : { type: 'app' }
}
