import { TEMPLATE_BY_ID } from '../lib/templates'
import './Stub.css'

export default function SuggestionsPage({ photo, suggestions, onPick, onBack }) {
  return (
    <div className="stub">
      <h2>Pick a direction</h2>
      <p>Six takes on your photo. Click one to refine.</p>

      <div className="stub-grid">
        {suggestions.map((s) => {
          const tpl = TEMPLATE_BY_ID[s.templateId]
          return (
            <button key={s.id} className="stub-card" onClick={() => onPick(s)}>
              <div className="stub-card-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
              <div className="stub-card-meta">
                <span className="stub-card-template">{tpl?.name || s.templateId}</span>
                <span className="stub-card-headline">{s.headline}</span>
              </div>
            </button>
          )
        })}
      </div>

      <button className="btn-ghost" onClick={onBack}>← back</button>
    </div>
  )
}
