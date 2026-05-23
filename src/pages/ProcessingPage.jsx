import { useEffect } from 'react'
import './Stub.css'

// Placeholder — will call Claude vision endpoint here.
// For now, fakes a 1.5s "thinking" delay and hands back mock suggestions.
export default function ProcessingPage({ photo, onReady }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onReady([
        { id: 1, templateId: 'drake', caption: '...' },
        { id: 2, templateId: 'distracted', caption: '...' },
        { id: 3, templateId: 'top-bottom', caption: '...' },
        { id: 4, templateId: 'brain', caption: '...' },
        { id: 5, templateId: 'two-buttons', caption: '...' },
        { id: 6, templateId: 'caption-only', caption: '...' },
      ])
    }, 1500)
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
