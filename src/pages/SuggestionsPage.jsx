import useImage from 'use-image'
import { TEMPLATE_BY_ID } from '../lib/templates'
import MemePreview from '../components/MemePreview'
import './SuggestionsPage.css'

export default function SuggestionsPage({ photo, suggestions, onPick, onBack }) {
  // Load the photo once at this level so all 6 cards share the same image
  // element (avoids 6 separate downloads + flash-on-load).
  const [image] = useImage(photo?.url, 'anonymous')

  return (
    <div className="suggestions">
      <div className="suggestions-head">
        <h2>Pick a direction</h2>
        <p>Six takes on your photo. Tap one to refine.</p>
      </div>

      <div className="suggestions-grid">
        {suggestions.map((s, i) => {
          const tpl = TEMPLATE_BY_ID[s.templateId]
          return (
            <button
              key={s.id || s.templateId || i}
              className="suggestion-card"
              onClick={() => onPick(s)}
            >
              <div className="suggestion-card-preview">
                <MemePreview
                  image={image}
                  templateId={s.templateId}
                  texts={s.texts}
                />
              </div>
              <div className="suggestion-card-meta">
                <span className="suggestion-card-template">
                  {tpl?.name || s.templateId}
                </span>
                <span className="suggestion-card-headline">{s.label || s.headline}</span>
              </div>
            </button>
          )
        })}
      </div>

      <button className="btn-ghost suggestions-back" onClick={onBack}>← back</button>
    </div>
  )
}
