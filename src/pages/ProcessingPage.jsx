import { useEffect } from 'react'
import './Stub.css'

// Placeholder mock until we wire the Claude vision endpoint.
// Returns 6 suggestions, one per template, with believable captions.
const MOCK_SUGGESTIONS = [
  {
    id: 1,
    templateId: 'classic',
    texts: { top: 'WHEN THE BUG FIXES ITSELF', bottom: "BUT YOU DON'T KNOW WHY" },
    headline: "when the bug fixes itself",
  },
  {
    id: 2,
    templateId: 'caption-bar',
    texts: { caption: 'pov: you finally finished the side project' },
    headline: 'pov: you finally finished the side project',
  },
  {
    id: 3,
    templateId: 'top-caption',
    texts: { caption: 'me, an intellectual, after one cup of coffee:' },
    headline: 'me, an intellectual, after one cup of coffee',
  },
  {
    id: 4,
    templateId: 'subtitle',
    texts: { subtitle: 'and that’s how I knew the demo was going to crash.' },
    headline: "wes anderson screencap",
  },
  {
    id: 5,
    templateId: 'stamp',
    texts: { stamp: 'VERDICT: ICONIC' },
    headline: 'verdict: iconic',
  },
  {
    id: 6,
    templateId: 'headline',
    texts: {
      headline: 'Local Dev Discovers Inner Peace',
      dek: 'sources confirm it lasted twelve minutes.',
    },
    headline: 'local dev discovers inner peace',
  },
]

export default function ProcessingPage({ photo, onReady }) {
  useEffect(() => {
    const t = setTimeout(() => onReady(MOCK_SUGGESTIONS), 1400)
    return () => clearTimeout(t)
  }, [onReady])

  return (
    <div className="stub">
      <div className="stub-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
      <div className="stub-spinner" />
      <h2>Reading the room…</h2>
      <p>Looking at your photo and thinking up six directions.</p>
    </div>
  )
}
