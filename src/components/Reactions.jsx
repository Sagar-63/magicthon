import { useEffect, useRef, useState } from 'react'
import { REACTION_EMOJIS, reactToMeme, subscribeToReactions, getMeme } from '../lib/store'
import './Reactions.css'

/**
 * Live emoji-reaction bar.
 *  - memeId: the id in store
 *  - mode: 'react' (recipient — tap to react) | 'watch' (creator — also taps, but framed as 'watching')
 *  - onReactionLanded: optional callback for external animations (e.g. floating burst)
 */
export default function Reactions({ memeId, mode = 'react', onReactionLanded }) {
  const [reactions, setReactions] = useState(() => getMeme(memeId)?.reactions || {})
  const [bumped, setBumped] = useState({}) // emoji -> timestamp, for bump animation
  const [floats, setFloats] = useState([]) // [{id, emoji, x}]
  const containerRef = useRef(null)

  // Refresh from store on mount (in case parent gave us a stale read).
  useEffect(() => {
    const m = getMeme(memeId)
    if (m) setReactions(m.reactions || {})
  }, [memeId])

  // Subscribe to live cross-tab reaction events.
  useEffect(() => {
    const unsubscribe = subscribeToReactions(memeId, ({ emoji }) => {
      const m = getMeme(memeId)
      if (m) setReactions(m.reactions || {})
      // animate
      setBumped((b) => ({ ...b, [emoji]: Date.now() }))
      pushFloat(emoji)
      onReactionLanded?.(emoji)
    })
    return unsubscribe
  }, [memeId, onReactionLanded])

  const pushFloat = (emoji) => {
    const id = Math.random().toString(36).slice(2)
    const x = 20 + Math.random() * 60 // % horizontal position
    setFloats((f) => [...f, { id, emoji, x }])
    setTimeout(() => setFloats((f) => f.filter((it) => it.id !== id)), 1400)
  }

  const handleClick = (emoji) => {
    const updated = reactToMeme(memeId, emoji)
    if (updated) setReactions({ ...updated.reactions })
    setBumped((b) => ({ ...b, [emoji]: Date.now() }))
    pushFloat(emoji)
    onReactionLanded?.(emoji)
  }

  const total = Object.values(reactions).reduce((a, b) => a + b, 0)

  return (
    <div className={`reactions reactions--${mode}`} ref={containerRef}>
      <div className="reactions-meta">
        <span className="reactions-meta-dot" />
        <span className="reactions-meta-label">
          {mode === 'watch' ? 'live reactions' : 'tap to react'}
        </span>
        <span className="reactions-meta-total">
          {total === 0 ? 'none yet' : `${total} so far`}
        </span>
      </div>

      <div className="reactions-bar">
        {REACTION_EMOJIS.map((emoji) => {
          const count = reactions[emoji] || 0
          const bumpAt = bumped[emoji]
          const isBumped = bumpAt && Date.now() - bumpAt < 600
          return (
            <button
              key={emoji}
              className={`reaction ${isBumped ? 'reaction--bumped' : ''} ${count > 0 ? 'reaction--has-count' : ''}`}
              onClick={() => handleClick(emoji)}
              type="button"
            >
              <span className="reaction-emoji">{emoji}</span>
              <span className="reaction-count">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="reactions-floats">
        {floats.map((f) => (
          <span
            key={f.id}
            className="reaction-float"
            style={{ left: `${f.x}%` }}
          >
            {f.emoji}
          </span>
        ))}
      </div>
    </div>
  )
}
