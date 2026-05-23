import { useEffect, useRef } from 'react'

/**
 * One-shot canvas confetti burst. Renders nothing once the animation ends.
 * `trigger` is any value — when it changes, a fresh burst fires.
 */
export default function Confetti({ trigger, durationMs = 2200, count = 140 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (trigger == null) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.width / dpr
    const H = () => canvas.height / dpr

    const colors = ['#c6ff3d', '#ff5c8a', '#3da9ff', '#ffd23f', '#ffffff', '#a78bfa']
    const shapes = ['rect', 'circle', 'tri']

    const particles = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
      const speed = 7 + Math.random() * 8
      return {
        x: W() / 2 + (Math.random() - 0.5) * 80,
        y: H() * 0.35,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.8),
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 1,
      }
    })

    let raf
    const start = performance.now()

    const tick = (now) => {
      const t = (now - start) / durationMs
      if (t >= 1) {
        ctx.clearRect(0, 0, W(), H())
        return
      }
      ctx.clearRect(0, 0, W(), H())
      for (const p of particles) {
        p.vy += 0.28 // gravity
        p.vx *= 0.995
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life = 1 - t

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.fillStyle = p.color
        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5)
        } else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(0, -p.size / 2)
          ctx.lineTo(p.size / 2, p.size / 2)
          ctx.lineTo(-p.size / 2, p.size / 2)
          ctx.closePath()
          ctx.fill()
        }
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [trigger, durationMs, count])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
      }}
      aria-hidden
    />
  )
}
