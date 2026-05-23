import { useEffect, useState } from 'react'
import { fetchSuggestions } from '../lib/api'
import './Stub.css'

// Local fallback if /api/suggest fails entirely (network down etc).
// In normal mock mode the server itself returns canned suggestions, so
// this only kicks in for a genuine failure.
const FALLBACK_SUGGESTIONS = [
  { templateId: 'classic',     label: 'when the bug fixes itself',  texts: { top: 'WHEN THE BUG FIXES ITSELF', bottom: "BUT YOU DON'T KNOW WHY" } },
  { templateId: 'caption-bar', label: 'pov: shipping a side project', texts: { caption: 'pov: you finally finished the side project' } },
  { templateId: 'top-caption', label: 'me after one cup of coffee', texts: { caption: 'me, an intellectual, after one cup of coffee:' } },
  { templateId: 'subtitle',    label: 'wes anderson energy',         texts: { subtitle: 'and that’s how I knew the demo was going to crash.' } },
  { templateId: 'stamp',       label: 'verdict: iconic',             texts: { stamp: 'VERDICT: ICONIC' } },
  { templateId: 'headline',    label: 'breaking: local dev calm',    texts: { headline: 'Local Dev Discovers Inner Peace', dek: 'sources confirm it lasted twelve minutes.' } },
]

export default function ProcessingPage({ photo, onReady }) {
  const [status, setStatus] = useState('thinking') // 'thinking' | 'error'
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    if (!photo?.file) {
      onReady(FALLBACK_SUGGESTIONS)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    ;(async () => {
      try {
        const { suggestions } = await fetchSuggestions(photo.file, {
          signal: controller.signal,
        })
        if (!cancelled) onReady(suggestions)
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return
        console.error('[processing] suggest failed:', err)
        setStatus('error')
        setErrorMsg(err.message || 'something went wrong')
        // Fall back so the user can still continue rather than getting stuck.
        setTimeout(() => {
          if (!cancelled) onReady(FALLBACK_SUGGESTIONS)
        }, 1200)
      }
    })()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [photo, onReady])

  return (
    <div className="stub">
      <div className="stub-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
      <div className="stub-spinner" />
      {status === 'thinking' ? (
        <>
          <h2>Reading the room…</h2>
          <p>Looking at your photo and thinking up six directions.</p>
        </>
      ) : (
        <>
          <h2>Going with defaults…</h2>
          <p>{errorMsg}. Continuing so you can still make something.</p>
        </>
      )}
    </div>
  )
}
