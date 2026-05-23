import { useEffect, useState } from 'react'
import { getMeme } from '../lib/store'
import Reactions from '../components/Reactions'
import './RecipientPage.css'

export default function RecipientPage({ memeId }) {
  const [meme, setMeme] = useState(() => getMeme(memeId))

  // Re-check store on mount (in case it was just written).
  useEffect(() => {
    setMeme(getMeme(memeId))
  }, [memeId])

  const goHome = () => {
    window.location.hash = ''
    window.location.reload()
  }

  if (!meme) {
    return (
      <div className="recipient recipient--missing">
        <div className="recipient-brand">
          <span className="recipient-brand-dot" />
          <span>MAGICTHON</span>
        </div>
        <h1 className="recipient-missing-title">404: meme not found</h1>
        <p className="recipient-missing-sub">
          The link expired, was opened in the wrong browser, or never existed at all.
        </p>
        <button className="btn-primary" onClick={goHome}>Make your own →</button>
      </div>
    )
  }

  return (
    <div className="recipient">
      <header className="recipient-header">
        <button className="recipient-brand" onClick={goHome} aria-label="Magicthon home">
          <span className="recipient-brand-dot" />
          <span>MAGICTHON</span>
        </button>
        <span className="recipient-meta">via magicthon.live</span>
      </header>

      <div className="recipient-content">
        <div className="recipient-frame">
          <img src={meme.dataUrl} alt="a magicthon meme" className="recipient-img" />
        </div>

        <div className="recipient-reactions">
          <Reactions memeId={memeId} mode="react" />
        </div>

        <a className="recipient-cta" onClick={goHome}>
          <span className="recipient-cta-arrow">→</span> make your own meme
        </a>
      </div>
    </div>
  )
}
