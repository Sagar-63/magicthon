import { useEffect, useState } from 'react'
import { saveMeme, buildShareUrl } from '../lib/store'
import Reactions from '../components/Reactions'
import Confetti from '../components/Confetti'
import './SharePage.css'

export default function SharePage({ meme, onEditAgain, onRestart }) {
  const [memeId, setMemeId] = useState(null)
  const [copied, setCopied] = useState(null) // 'image' | 'link' | null
  const [error, setError] = useState(null)

  // Save the meme to the backend on mount; the share id comes from the server.
  useEffect(() => {
    if (!meme) return
    let cancelled = false
    ;(async () => {
      try {
        const { id } = await saveMeme(meme)
        if (!cancelled) setMemeId(id)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not save')
      }
    })()
    return () => { cancelled = true }
  }, [meme])

  if (!meme) {
    return (
      <div className="share share--empty">
        <h2>Nothing to ship yet.</h2>
        <button className="btn-primary" onClick={onRestart}>Start over</button>
      </div>
    )
  }

  const shareUrl = memeId ? buildShareUrl(memeId) : ''
  const prettyUrl = shareUrl.replace(/^https?:\/\//, '')

  const handleDownload = () => {
    const a = document.createElement('a')
    a.download = `magicthon-${Date.now()}.png`
    a.href = meme.dataUrl
    a.click()
  }

  const handleCopyImage = async () => {
    try {
      const blob = await (await fetch(meme.dataUrl)).blob()
      if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setCopied('image')
        setTimeout(() => setCopied(null), 2000)
      } else {
        handleDownload()
        setError('Clipboard not supported here — downloaded instead.')
      }
    } catch (err) {
      setError(err.message || 'Could not copy')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied('link')
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      setError(err.message || 'Could not copy link')
    }
  }

  const openAsRecipient = () => {
    window.open(shareUrl, '_blank', 'noopener')
  }

  return (
    <div className="share">
      <Confetti trigger={memeId} />
      <div className="share-head">
        <h1 className="share-title">
          Shipped<span className="accent">.</span>
        </h1>
        <p className="share-sub">Your meme is ready. Send it to someone with bad taste.</p>
      </div>

      <div className="share-frame">
        <img src={meme.dataUrl} alt="your meme" className="share-img" />
        <span className="share-stamp">freshly cooked</span>
      </div>

      {/* Share link card */}
      <div className="share-link">
        <div className="share-link-row">
          <span className="share-link-prefix">link</span>
          <span className="share-link-url" title={shareUrl}>{prettyUrl || 'preparing…'}</span>
          <button
            className="share-link-btn"
            onClick={handleCopyLink}
            disabled={!memeId}
          >
            {copied === 'link' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <button
          className="share-link-preview"
          onClick={openAsRecipient}
          disabled={!memeId}
        >
          Open as a recipient ↗
        </button>
      </div>

      {/* Live reactions for the creator */}
      {memeId && (
        <div className="share-reactions">
          <Reactions memeId={memeId} mode="watch" />
        </div>
      )}

      {/* File actions */}
      <div className="share-actions">
        <button className="btn-primary" onClick={handleDownload}>
          <DownloadIcon /> Download PNG
        </button>
        <button className="btn-ghost" onClick={handleCopyImage}>
          {copied === 'image' ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy image</>}
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
