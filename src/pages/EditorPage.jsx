import './Stub.css'

export default function EditorPage({ photo, suggestion, onDone, onBack }) {
  return (
    <div className="stub">
      <h2>Editor</h2>
      <p>Canvas editor will live here.</p>
      <div className="stub-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
      <p className="stub-mono">template: {suggestion?.templateId}</p>
      <div className="stub-actions">
        <button className="btn-ghost" onClick={onBack}>← back</button>
        <button className="btn-primary" onClick={onDone}>Ship it →</button>
      </div>
    </div>
  )
}
