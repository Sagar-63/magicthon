import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KImage, Text as KText, Rect } from 'react-konva'
import { TEMPLATE_BY_ID, instantiateTemplate } from '../lib/templates'

/**
 * Read-only mini Konva renderer that shows a photo + a template recipe + texts.
 * Used on the suggestions page so each card shows the actual meme that would
 * be produced if the user picked it.
 *
 * Pass either:
 *   image  — an HTMLImageElement (preferred when rendering many at once)
 *   photoUrl — falls back to loading the image internally
 */
export default function MemePreview({
  image,
  templateId,
  texts,
  className = '',
}) {
  const wrapRef = useRef(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  // Auto-fit width via ResizeObserver, then derive height from photo aspect.
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect
      const aspect = image ? image.height / image.width : 1
      setSize({ w: cr.width, h: cr.width * aspect })
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [image])

  const template = TEMPLATE_BY_ID[templateId]
  const layers = template ? instantiateTemplate(template, texts || {}) : []

  return (
    <div ref={wrapRef} className={`meme-preview ${className}`}>
      {size.w > 0 && image && template && (
        <Stage width={size.w} height={size.h} listening={false}>
          <Layer>
            <KImage image={image} x={0} y={0} width={size.w} height={size.h} />

            {template.bar && (
              <Rect
                x={0}
                y={template.bar.y * size.h}
                width={size.w}
                height={template.bar.height * size.h}
                fill={template.bar.color}
              />
            )}
            {template.panel && (
              <Rect
                x={template.panel.x * size.w}
                y={template.panel.y * size.h}
                width={template.panel.width * size.w}
                height={template.panel.height * size.h}
                fill={template.panel.color}
              />
            )}

            {layers.map((layer) => {
              const fontSize = layer.sizePct * size.h
              const text =
                layer.transform === 'uppercase'
                  ? layer.content.toUpperCase()
                  : layer.content
              return (
                <KText
                  key={layer.id}
                  text={text}
                  x={layer.x * size.w}
                  y={layer.y * size.h}
                  width={layer.width * size.w}
                  fontSize={fontSize}
                  fontFamily={layer.font}
                  fontStyle={
                    layer.weight === 'bold' || layer.weight === '700'
                      ? 'bold'
                      : 'normal'
                  }
                  fill={layer.fill}
                  stroke={layer.stroke || undefined}
                  strokeWidth={layer.stroke ? layer.strokePct * fontSize : 0}
                  fillAfterStrokeEnabled={!!layer.stroke}
                  lineJoin="round"
                  align={layer.align}
                  shadowColor={layer.shadow ? '#000' : undefined}
                  shadowBlur={layer.shadow ? fontSize * 0.28 : 0}
                  shadowOpacity={layer.shadow ? 0.9 : 0}
                  shadowOffsetY={layer.shadow ? fontSize * 0.06 : 0}
                />
              )
            })}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
