import './Header.css'

const LABELS = {
  upload: '01 upload',
  processing: '02 reading',
  suggestions: '03 pick',
  editor: '04 edit',
  share: '05 ship',
}

export default function Header({ step, steps, onReset }) {
  return (
    <header className="header">
      <button className="brand" onClick={onReset} aria-label="Start over">
        <span className="brand-dot" />
        <span className="brand-name">MAGICTHON</span>
      </button>
      <nav className="steps" aria-label="Progress">
        {steps.map((s, i) => {
          const idx = steps.indexOf(step)
          const active = s === step
          const done = i < idx
          return (
            <span
              key={s}
              className={`step ${active ? 'step--active' : ''} ${done ? 'step--done' : ''}`}
            >
              {LABELS[s]}
            </span>
          )
        })}
      </nav>
      <span className="badge">build day</span>
    </header>
  )
}
