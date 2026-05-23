import './Stub.css'

export default function SharePage({ photo, suggestion, onRestart }) {
  return (
    <div className="stub">
      <h2>Shipped.</h2>
      <p>Share + reactions will live here.</p>
      <div className="stub-thumb" style={{ backgroundImage: `url(${photo?.url})` }} />
      <button className="btn-primary" onClick={onRestart}>Make another</button>
    </div>
  )
}
