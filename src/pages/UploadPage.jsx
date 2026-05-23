import { useEffect, useRef, useState } from 'react'
import './UploadPage.css'

/**
 * Three-tile upload page.
 * Tiles: Upload (file picker), Paste/Drop (clipboard + drag-anywhere), Webcam (live camera).
 * Clicking a tile expands it to its active surface.
 */
export default function UploadPage({ onPhoto }) {
  const [activeTile, setActiveTile] = useState(null) // 'upload' | 'paste' | 'webcam' | null
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // ─── File handling ───────────────────────────────────────────────
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    onPhoto({ url, file })
  }

  // ─── Drag & drop anywhere ────────────────────────────────────────
  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault()
      if (e.dataTransfer?.types?.includes('Files')) {
        setIsDragging(true)
        document.body.classList.add('is-dragging')
      }
    }
    const onDragOver = (e) => e.preventDefault()
    const onDragLeave = (e) => {
      e.preventDefault()
      // Only clear when leaving the window
      if (e.relatedTarget === null || e.clientX === 0) {
        setIsDragging(false)
        document.body.classList.remove('is-dragging')
      }
    }
    const onDrop = (e) => {
      e.preventDefault()
      setIsDragging(false)
      document.body.classList.remove('is-dragging')
      const file = e.dataTransfer?.files?.[0]
      if (file) handleFile(file)
    }
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
      document.body.classList.remove('is-dragging')
    }
  }, [])

  // ─── Clipboard paste ─────────────────────────────────────────────
  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.items || [])].find((i) =>
        i.type.startsWith('image/')
      )
      if (item) {
        const file = item.getAsFile()
        if (file) handleFile(file)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [])

  // ─── Tile actions ────────────────────────────────────────────────
  const onTileClick = (kind) => {
    if (kind === 'upload') {
      fileInputRef.current?.click()
    } else {
      setActiveTile(kind)
    }
  }

  return (
    <div className="upload">
      <div className="upload-hero">
        <h1 className="upload-title">
          Make a meme<br />
          <span className="accent">that lands.</span>
        </h1>
        <p className="upload-sub">
          Funny is the hard part. Drop a photo and we&apos;ll suggest six directions.
        </p>
      </div>

      <div className="tiles">
        <Tile
          kind="upload"
          label="Upload"
          hint="From your device"
          icon={<UploadIcon />}
          onClick={() => onTileClick('upload')}
        />
        <Tile
          kind="paste"
          label="Paste / Drop"
          hint="Drag anywhere · ⌘V"
          icon={<PasteIcon />}
          onClick={() => onTileClick('paste')}
          active={activeTile === 'paste'}
        />
        <Tile
          kind="webcam"
          label="Webcam"
          hint="Snap a fresh one"
          icon={<CameraIcon />}
          onClick={() => onTileClick('webcam')}
          active={activeTile === 'webcam'}
        />
      </div>

      <div className="formats">
        <span className="dot" /> JPG · PNG · HEIC · WEBP &nbsp;·&nbsp; up to 10 MB
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {activeTile === 'webcam' && (
        <WebcamModal onClose={() => setActiveTile(null)} onCapture={handleFile} />
      )}

      {activeTile === 'paste' && (
        <PasteOverlay onClose={() => setActiveTile(null)} />
      )}

      {isDragging && (
        <div className="drag-banner">drop it like it&apos;s hot</div>
      )}
    </div>
  )
}

function Tile({ label, hint, icon, onClick, active }) {
  return (
    <button
      type="button"
      className={`tile ${active ? 'tile--active' : ''}`}
      onClick={onClick}
    >
      <div className="tile-icon">{icon}</div>
      <div className="tile-text">
        <span className="tile-label">{label}</span>
        <span className="tile-hint">{hint}</span>
      </div>
      <span className="tile-arrow" aria-hidden>→</span>
    </button>
  )
}

function PasteOverlay({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-box" onClick={(e) => e.stopPropagation()}>
        <h3>Paste or drag a photo</h3>
        <p>Press <kbd>⌘</kbd> + <kbd>V</kbd> to paste from clipboard, or just drag a photo anywhere onto the page.</p>
        <button className="btn-ghost" onClick={onClose}>Got it</button>
      </div>
    </div>
  )
}

function WebcamModal({ onClose, onCapture }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let stream
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 } },
          audio: false,
        })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setReady(true)
        }
      } catch (err) {
        setError(err.message || 'Could not access camera')
      }
    }
    start()
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const snap = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
      },
      'image/jpeg',
      0.92
    )
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="webcam-box" onClick={(e) => e.stopPropagation()}>
        <div className="webcam-frame">
          {error ? (
            <div className="webcam-error">
              <p>{error}</p>
              <p className="webcam-hint">Check browser permissions and try again.</p>
            </div>
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted />
              {!ready && <div className="webcam-loading">starting camera…</div>}
            </>
          )}
        </div>
        <div className="webcam-actions">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={snap} disabled={!ready || error}>
            <span className="shutter" /> Snap
          </button>
        </div>
        <canvas ref={canvasRef} hidden />
      </div>
    </div>
  )
}

// ─── Icons ──────────────────────────────────────────────────────────
function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}
function PasteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 4h6v2H9z" fill="currentColor" stroke="none" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  )
}
function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h3l2-3h8l2 3h3v12H3z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}
