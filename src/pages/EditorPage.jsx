import { useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Image as KImage, Text as KText, Rect, Transformer } from 'react-konva'
import useImage from 'use-image'
import { TEMPLATES, TEMPLATE_BY_ID, instantiateTemplate } from '../lib/templates'
import './EditorPage.css'

const MAX_CANVAS_WIDTH = 560
const MIN_CANVAS_WIDTH = 280

export default function EditorPage({ photo, suggestion, onDone, onBack }) {
  const containerRef = useRef(null)
  const stageRef = useRef(null)

  const [image] = useImage(photo?.url, 'anonymous')

  // ─── Sizing ───────────────────────────────────────────────────────
  const [containerWidth, setContainerWidth] = useState(MAX_CANVAS_WIDTH)
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth || MAX_CANVAS_WIDTH
      setContainerWidth(Math.max(MIN_CANVAS_WIDTH, Math.min(MAX_CANVAS_WIDTH, w)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const aspect = image ? image.height / image.width : 1
  const canvasW = containerWidth
  const canvasH = canvasW * aspect

  // ─── Editor state ─────────────────────────────────────────────────
  const initialTemplateId = suggestion?.templateId || 'classic'
  const [templateId, setTemplateId] = useState(
    TEMPLATE_BY_ID[initialTemplateId] ? initialTemplateId : 'classic'
  )
  const template = TEMPLATE_BY_ID[templateId]

  const [layers, setLayers] = useState(() =>
    instantiateTemplate(template, suggestion?.texts || {})
  )
  const [selectedId, setSelectedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  // When template changes, re-instantiate layers, preserving content where slot ids match.
  const switchTemplate = (newId) => {
    const newTpl = TEMPLATE_BY_ID[newId]
    if (!newTpl) return
    const existingBySlot = Object.fromEntries(layers.map((l) => [l.id, l.content]))
    setLayers(instantiateTemplate(newTpl, existingBySlot))
    setTemplateId(newId)
    setSelectedId(null)
    setEditingId(null)
  }

  // ─── Selection / Transformer ──────────────────────────────────────
  const transformerRef = useRef(null)
  const textNodeRefs = useRef({})

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (selectedId && textNodeRefs.current[selectedId]) {
      tr.nodes([textNodeRefs.current[selectedId]])
      tr.getLayer()?.batchDraw()
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId, layers])

  const onStageMouseDown = (e) => {
    // Clicked empty area
    if (e.target === e.target.getStage() || e.target.className === 'Image' || e.target.className === 'Rect') {
      setSelectedId(null)
    }
  }

  // ─── Drag handling ────────────────────────────────────────────────
  const updateLayer = (id, patch) =>
    setLayers((arr) => arr.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const onDragEnd = (id) => (e) => {
    const node = e.target
    updateLayer(id, {
      x: node.x() / canvasW,
      y: node.y() / canvasH,
    })
  }

  // ─── Selected layer helpers ──────────────────────────────────────
  const selectedLayer = layers.find((l) => l.id === selectedId) || null

  // ─── Inline editing (HTML textarea overlay) ──────────────────────
  const editingLayer = layers.find((l) => l.id === editingId) || null
  const editingNode = editingId ? textNodeRefs.current[editingId] : null
  const editTextareaStyle = useMemo(() => {
    if (!editingLayer || !editingNode || !canvasW) return null
    const node = editingNode
    const fontSize = editingLayer.sizePct * canvasH
    return {
      position: 'absolute',
      top: `${node.y()}px`,
      left: `${node.x()}px`,
      width: `${editingLayer.width * canvasW}px`,
      fontSize: `${fontSize}px`,
      fontFamily: editingLayer.font,
      fontWeight: editingLayer.weight,
      color: editingLayer.fill,
      textAlign: editingLayer.align,
      textTransform: editingLayer.transform,
      lineHeight: 1.1,
      background: 'transparent',
      border: '1px dashed var(--accent)',
      outline: 'none',
      resize: 'none',
      padding: 0,
      margin: 0,
      overflow: 'hidden',
      WebkitTextStroke: editingLayer.stroke
        ? `${editingLayer.strokePct * fontSize}px ${editingLayer.stroke}`
        : 'none',
    }
  }, [editingLayer, editingNode, canvasW, canvasH])

  const finishEdit = (value) => {
    if (editingId) updateLayer(editingId, { content: value })
    setEditingId(null)
  }

  // ─── Render helpers ──────────────────────────────────────────────
  const renderText = (layer) => {
    const fontSize = layer.sizePct * canvasH
    const text =
      layer.transform === 'uppercase' ? layer.content.toUpperCase() : layer.content
    return (
      <KText
        key={layer.id}
        ref={(node) => { if (node) textNodeRefs.current[layer.id] = node }}
        text={text}
        x={layer.x * canvasW}
        y={layer.y * canvasH}
        width={layer.width * canvasW}
        fontSize={fontSize}
        fontFamily={layer.font}
        fontStyle={layer.weight === 'bold' || layer.weight === '700' ? 'bold' : 'normal'}
        fill={layer.fill}
        stroke={layer.stroke || undefined}
        strokeWidth={layer.stroke ? layer.strokePct * fontSize : 0}
        lineJoin="round"
        align={layer.align}
        shadowColor={layer.shadow ? '#000' : undefined}
        shadowBlur={layer.shadow ? fontSize * 0.15 : 0}
        shadowOpacity={layer.shadow ? 0.7 : 0}
        shadowOffsetY={layer.shadow ? fontSize * 0.05 : 0}
        draggable
        onDragEnd={onDragEnd(layer.id)}
        onClick={() => setSelectedId(layer.id)}
        onTap={() => setSelectedId(layer.id)}
        onDblClick={() => { setSelectedId(layer.id); setEditingId(layer.id) }}
        onDblTap={() => { setSelectedId(layer.id); setEditingId(layer.id) }}
        visible={editingId !== layer.id}
        listening
      />
    )
  }

  return (
    <div className="editor">
      <div className="editor-bar">
        <button className="btn-ghost" onClick={onBack}>← back</button>
        <div className="editor-bar-mid">
          <span className="editor-template-name">{template.name}</span>
          <span className="editor-template-desc">{template.desc}</span>
        </div>
        <button className="btn-primary" onClick={onDone}>Ship it →</button>
      </div>

      {/* Floating toolbar — sits above the canvas, only visible on selection */}
      <FloatingToolbar
        layer={selectedLayer}
        onChange={(patch) => selectedId && updateLayer(selectedId, patch)}
        onEdit={() => selectedId && setEditingId(selectedId)}
      />

      <div className="editor-canvas-wrap">
        <div ref={containerRef} className="editor-canvas" style={{ aspectRatio: image ? `${image.width} / ${image.height}` : '1 / 1' }}>
          {canvasH > 0 && (
            <Stage
              ref={stageRef}
              width={canvasW}
              height={canvasH}
              onMouseDown={onStageMouseDown}
              onTouchStart={onStageMouseDown}
            >
              <Layer>
                {image && (
                  <KImage image={image} x={0} y={0} width={canvasW} height={canvasH} listening={false} />
                )}
                {template.bar && (
                  <Rect
                    x={0}
                    y={template.bar.y * canvasH}
                    width={canvasW}
                    height={template.bar.height * canvasH}
                    fill={template.bar.color}
                    listening={false}
                  />
                )}
                {template.panel && (
                  <Rect
                    x={template.panel.x * canvasW}
                    y={template.panel.y * canvasH}
                    width={template.panel.width * canvasW}
                    height={template.panel.height * canvasH}
                    fill={template.panel.color}
                    listening={false}
                  />
                )}
                {layers.map(renderText)}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled={false}
                  enabledAnchors={[]}
                  borderStroke="#c6ff3d"
                  borderStrokeWidth={1.5}
                  borderDash={[4, 3]}
                />
              </Layer>
            </Stage>
          )}

          {/* Inline editor textarea overlay */}
          {editingLayer && editTextareaStyle && (
            <textarea
              autoFocus
              defaultValue={editingLayer.content}
              style={editTextareaStyle}
              onBlur={(e) => finishEdit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  finishEdit(e.currentTarget.value)
                }
                if (e.key === 'Escape') {
                  setEditingId(null)
                }
              }}
            />
          )}
        </div>

        <div className="editor-tip">
          <span>tap text to select · drag to move · double-click to rewrite</span>
        </div>
      </div>

      {/* Template rail */}
      <div className="rail">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            className={`rail-item ${t.id === templateId ? 'rail-item--active' : ''}`}
            onClick={() => switchTemplate(t.id)}
            title={t.name}
          >
            <RailThumb tpl={t} active={t.id === templateId} />
            <span className="rail-label">{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Floating toolbar ──────────────────────────────────────────────
const FONT_OPTIONS = [
  { label: 'Impact', value: 'Impact, "Anton", "Space Grotesk", sans-serif' },
  { label: 'Inter', value: '"Inter", system-ui, sans-serif' },
  { label: 'Space Grotesk', value: '"Space Grotesk", "Inter", sans-serif' },
  { label: 'Mono', value: '"JetBrains Mono", ui-monospace, monospace' },
]
const COLORS = ['#ffffff', '#0a0a0a', '#c6ff3d', '#ff5c8a', '#3da9ff', '#ffd23f']

function FloatingToolbar({ layer, onChange, onEdit }) {
  if (!layer) {
    return (
      <div className="toolbar toolbar--hidden">
        <span className="toolbar-empty">click any text to edit</span>
      </div>
    )
  }
  return (
    <div className="toolbar">
      <button className="toolbar-btn toolbar-btn--accent" onClick={onEdit}>
        ✎ Edit text
      </button>
      <div className="toolbar-divider" />

      <label className="toolbar-group">
        <span className="toolbar-label">Font</span>
        <select
          value={layer.font}
          onChange={(e) => onChange({ font: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>{f.label}</option>
          ))}
        </select>
      </label>

      <label className="toolbar-group">
        <span className="toolbar-label">Size</span>
        <input
          type="range"
          min="0.02"
          max="0.18"
          step="0.005"
          value={layer.sizePct}
          onChange={(e) => onChange({ sizePct: parseFloat(e.target.value) })}
        />
      </label>

      <div className="toolbar-group">
        <span className="toolbar-label">Color</span>
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`swatch ${layer.fill === c ? 'swatch--on' : ''}`}
              style={{ background: c }}
              onClick={() => onChange({ fill: c })}
              aria-label={`color ${c}`}
            />
          ))}
        </div>
      </div>

      <label className="toolbar-toggle">
        <input
          type="checkbox"
          checked={!!layer.stroke}
          onChange={(e) => onChange({ stroke: e.target.checked ? '#000000' : null })}
        />
        Outline
      </label>

      <label className="toolbar-toggle">
        <input
          type="checkbox"
          checked={layer.shadow}
          onChange={(e) => onChange({ shadow: e.target.checked })}
        />
        Shadow
      </label>
    </div>
  )
}

// ─── Mini template thumbnail (no real photo, just layout indicator) ────
function RailThumb({ tpl, active }) {
  return (
    <div className={`rail-thumb ${active ? 'rail-thumb--active' : ''}`}>
      <div className="rail-thumb-photo" />
      {tpl.bar && (
        <div
          className="rail-thumb-bar"
          style={{
            top: `${tpl.bar.y * 100}%`,
            height: `${tpl.bar.height * 100}%`,
            background: tpl.bar.color,
          }}
        />
      )}
      {tpl.panel && (
        <div
          className="rail-thumb-bar"
          style={{
            top: `${tpl.panel.y * 100}%`,
            height: `${tpl.panel.height * 100}%`,
            background: tpl.panel.color,
          }}
        />
      )}
      {tpl.slots.map((s) => (
        <div
          key={s.id}
          className="rail-thumb-text"
          style={{
            top: `${s.y * 100}%`,
            left: `${s.x * 100}%`,
            width: `${s.width * 100}%`,
            background: s.fill,
            height: `${Math.max(2, s.sizePct * 100 * 0.6)}%`,
          }}
        />
      ))}
    </div>
  )
}
