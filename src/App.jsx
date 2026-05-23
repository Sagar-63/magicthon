import { useState } from 'react'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import SuggestionsPage from './pages/SuggestionsPage'
import EditorPage from './pages/EditorPage'
import SharePage from './pages/SharePage'
import Header from './components/Header'
import './App.css'

const STEPS = ['upload', 'processing', 'suggestions', 'editor', 'share']

export default function App() {
  const [step, setStep] = useState('upload')
  const [photo, setPhoto] = useState(null) // { url, file }
  const [suggestions, setSuggestions] = useState([])
  const [chosen, setChosen] = useState(null)

  const reset = () => {
    setStep('upload')
    setPhoto(null)
    setSuggestions([])
    setChosen(null)
  }

  return (
    <div className="app">
      <Header step={step} steps={STEPS} onReset={reset} />
      <main className="app-main">
        {step === 'upload' && (
          <UploadPage
            onPhoto={(p) => {
              setPhoto(p)
              setStep('processing')
            }}
          />
        )}
        {step === 'processing' && (
          <ProcessingPage
            photo={photo}
            onReady={(s) => {
              setSuggestions(s)
              setStep('suggestions')
            }}
          />
        )}
        {step === 'suggestions' && (
          <SuggestionsPage
            photo={photo}
            suggestions={suggestions}
            onPick={(s) => {
              setChosen(s)
              setStep('editor')
            }}
            onBack={() => setStep('upload')}
          />
        )}
        {step === 'editor' && (
          <EditorPage
            photo={photo}
            suggestion={chosen}
            onDone={() => setStep('share')}
            onBack={() => setStep('suggestions')}
          />
        )}
        {step === 'share' && (
          <SharePage
            photo={photo}
            suggestion={chosen}
            onRestart={reset}
          />
        )}
      </main>
    </div>
  )
}
