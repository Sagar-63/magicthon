import { useState } from 'react'
import './SharePage.css'

export default function SharePage({ meme, onEditAgain, onRestart }) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)

  if (!meme) {
    return (
      <div className="share share--empty">
        <h2>Nothing to ship yet.</h2>
        <button className="btn-primary" onClick={onRestart}>Start over</button>
      </div>
    )
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.download = `magicthon-${Date.now()}.png`
    a.href = meme.dataUrl
    a.click()
  }

  const handleCopy = async () => {
    try {
      const blob = await (await fetch(meme.dataUrl)).blob()
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback: trigger download instead.
        handleDownload()
        setError('Clipboard not supported here — downloaded instead.')
      }
    } catch (err) {
      setError(err.message || 'Could not copy')
    }
  }

  return (
    <div className="share">
      <div className="share-head">
        <h1 className="share-title">
          Shipped.<span className="accent">.</span>
        </h1>
        <p className="share-sub">Your meme is ready. Save it, or send it to someone with bad taste.</p>
      </div>

      <div className="share-frame">
        <img src={meme.dataUrl} alt="your meme" className="share-img" />
        <span className="share-stamp">freshly cooked</span>
      </div>

      <div className="share-actions">
        <button className="btn-primary" onClick={handleDownload}>
          <DownloadIcon /> Download PNG
        </button>
        <button className="btn-ghost" onClick={handleCopy}>
          {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy to clipboard</>}
        </button>
        <button className="btn-ghost btn-link" disabled title="Coming next">
          <LinkIcon /> Share link (soon)
        </button>
      </div>

      {error && <p className="share-error">{error}</p>}

      <div className="share-footer">
        <button className="btn-ghost" onClick={onEditAgain}>← Tweak it</button>
        <button className="btn-ghost" onClick={onRestart}>Make another →</button>
      </div>
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v12M12 16l-5-5M12 16l5-5" />
      <path d="M4 19h16" />
    </svg>
  )
}
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12l5 5L20 6" />
    </svg>
  )
}
function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />
    </svg>
  )
}
