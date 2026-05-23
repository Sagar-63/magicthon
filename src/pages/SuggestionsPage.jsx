import './Stub.css'

export default function SuggestionsPage({ photo, suggestions, onPick, onBack }) {
  return (
    <div className="stub">
      <h2>Pick a direction</h2>
      <p>Six takes on your photo. Click one to refine.</p>
      <div className="stub-grid">
        {suggestions.map((s) => (
          <button key={s.id} className="stub-card" onClick={() => onPick(s)}>
            <div className="stub-card-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
            <span className="stub-card-label">{s.templateId}</span>
          </button>
        ))}
      </div>
      <button className="btn-ghost" onClick={onBack}>← back</button>
    </div>
  )
}
