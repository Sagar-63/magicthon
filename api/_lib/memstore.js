/**
 * In-memory dev store. Used when mode.db === 'mock' so endpoints behave
 * end-to-end during local development without requiring a Postgres DB.
 *
 * Survives only while the dev process is alive (lost on restart). In
 * production (mode.db === 'real'), Neon Postgres is used instead.
 */

const memes = new Map() // id -> { id, image_url, width, height, template_id, layers, created_at }
const reactions = new Map() // id -> [{ emoji, created_at }]

export const memStore = {
  saveMeme(meme) {
    memes.set(meme.id, meme)
    if (!reactions.has(meme.id)) reactions.set(meme.id, [])
    return meme
  },
  getMeme(id) {
    return memes.get(id) || null
  },
  addReaction(id, emoji) {
    if (!memes.has(id)) return null
    const row = { emoji, created_at: new Date().toISOString() }
    reactions.get(id).push(row)
    return row
  },
  getReactionCounts(id) {
    const list = reactions.get(id) || []
    return list.reduce((acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1
      return acc
    }, {})
  },
}
