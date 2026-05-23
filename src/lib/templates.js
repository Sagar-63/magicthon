/**
 * Template recipes. Each template defines named text slots positioned as
 * percentages of the canvas (so they work on any photo aspect ratio).
 *
 * A slot has:
 *   id      - unique within the template
 *   x, y    - top-left corner as fraction of canvas (0..1)
 *   width   - width as fraction of canvas (0..1); height is auto
 *   align   - 'left' | 'center' | 'right'
 *   font    - font family (must be loaded via index.html)
 *   sizePct - font size as fraction of canvas height
 *   fill    - text color
 *   stroke  - outline color (or null)
 *   strokePct - outline width as fraction of font size
 *   shadow  - boolean
 *   weight  - 'normal' | 'bold' | numeric
 *   transform - 'uppercase' | 'none'
 *   defaultText - placeholder when no caption provided
 */

export const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Impact, top + bottom, the OG',
    slots: [
      {
        id: 'top',
        x: 0.05, y: 0.03, width: 0.9, align: 'center',
        font: 'Impact, "Anton", "Space Grotesk", sans-serif',
        sizePct: 0.10, fill: '#ffffff',
        stroke: '#000000', strokePct: 0.12,
        shadow: false, weight: 'normal', transform: 'uppercase',
        defaultText: 'TOP TEXT',
      },
      {
        id: 'bottom',
        x: 0.05, y: 0.85, width: 0.9, align: 'center',
        font: 'Impact, "Anton", "Space Grotesk", sans-serif',
        sizePct: 0.10, fill: '#ffffff',
        stroke: '#000000', strokePct: 0.12,
        shadow: false, weight: 'normal', transform: 'uppercase',
        defaultText: 'BOTTOM TEXT',
      },
    ],
  },
  {
    id: 'caption-bar',
    name: 'Caption Bar',
    desc: 'Modern reaction-meme look',
    bar: { y: 0.86, height: 0.14, color: '#000000' },
    slots: [
      {
        id: 'caption',
        x: 0.05, y: 0.89, width: 0.9, align: 'center',
        font: '"Inter", system-ui, sans-serif',
        sizePct: 0.055, fill: '#ffffff',
        stroke: null, strokePct: 0,
        shadow: false, weight: '600', transform: 'none',
        defaultText: 'when the code finally compiles',
      },
    ],
  },
  {
    id: 'top-caption',
    name: 'Top Caption',
    desc: 'White panel above, Twitter-meme energy',
    panel: { x: 0, y: 0, width: 1, height: 0.18, color: '#ffffff' },
    slots: [
      {
        id: 'caption',
        x: 0.05, y: 0.04, width: 0.9, align: 'center',
        font: '"Inter", system-ui, sans-serif',
        sizePct: 0.05, fill: '#0a0a0a',
        stroke: null, strokePct: 0,
        shadow: false, weight: '500', transform: 'none',
        defaultText: 'me, an intellectual, after one cup of coffee:',
      },
    ],
  },
  {
    id: 'subtitle',
    name: 'Subtitle',
    desc: 'Like a Wes Anderson screencap',
    slots: [
      {
        id: 'subtitle',
        x: 0.08, y: 0.88, width: 0.84, align: 'center',
        font: '"Space Grotesk", "Inter", sans-serif',
        sizePct: 0.038, fill: '#ffffff',
        stroke: '#000000', strokePct: 0.18,
        shadow: true, weight: '500', transform: 'none',
        defaultText: 'and that’s how I knew I was the problem.',
      },
    ],
  },
  {
    id: 'stamp',
    name: 'Verdict Stamp',
    desc: 'A bold verdict in the corner',
    slots: [
      {
        id: 'stamp',
        x: 0.04, y: 0.06, width: 0.4, align: 'left',
        font: '"Space Grotesk", "Inter", sans-serif',
        sizePct: 0.07, fill: '#c6ff3d',
        stroke: '#0a0a0a', strokePct: 0.18,
        shadow: true, weight: '700', transform: 'uppercase',
        defaultText: 'verdict: vibes',
      },
    ],
  },
  {
    id: 'headline',
    name: 'Headline',
    desc: 'Newspaper-style headline + dek',
    slots: [
      {
        id: 'headline',
        x: 0.05, y: 0.04, width: 0.9, align: 'left',
        font: '"Space Grotesk", "Inter", sans-serif',
        sizePct: 0.08, fill: '#ffffff',
        stroke: '#000000', strokePct: 0.10,
        shadow: true, weight: '700', transform: 'none',
        defaultText: 'Local Man Discovers Inner Peace',
      },
      {
        id: 'dek',
        x: 0.05, y: 0.16, width: 0.9, align: 'left',
        font: '"Inter", system-ui, sans-serif',
        sizePct: 0.034, fill: '#ffffff',
        stroke: '#000000', strokePct: 0.20,
        shadow: false, weight: '400', transform: 'none',
        defaultText: 'sources confirm it lasted twelve minutes.',
      },
    ],
  },
]

export const TEMPLATE_BY_ID = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]))

/** Convert a template + map of captions into editable text-layer state. */
export function instantiateTemplate(template, captionsBySlot = {}) {
  return template.slots.map((slot) => ({
    ...slot,
    content: captionsBySlot[slot.id] ?? slot.defaultText,
  }))
}
