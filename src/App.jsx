import { useEffect, useState } from 'react'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import SuggestionsPage from './pages/SuggestionsPage'
import EditorPage from './pages/EditorPage'
import SharePage from './pages/SharePage'
import RecipientPage from './pages/RecipientPage'
import Header from './components/Header'
import { parseRoute } from './lib/store'
import './App.css'

const STEPS = ['upload', 'processing', 'suggestions', 'editor', 'share']

export default function App() {
  const [route, setRoute] = useState(() => parseRoute())

  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.type === 'recipient') {
    return <RecipientPage memeId={route.id} />
  }

  return <CreatorApp />
}

function CreatorApp() {
  const [step, setStep] = useState('upload')
  const [photo, setPhoto] = useState(null) // { url, file }
  const [suggestions, setSuggestions] = useState([])
  const [chosen, setChosen] = useState(null)
  const [finalMeme, setFinalMeme] = useState(null) // { dataUrl, width, height, templateId, layers }

  const reset = () => {
    setStep('upload')
    setPhoto(null)
    setSuggestions([])
    setChosen(null)
    setFinalMeme(null)
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
            onDone={(meme) => {
              setFinalMeme(meme)
              setStep('share')
            }}
            onBack={() => setStep('suggestions')}
          />
        )}
        {step === 'share' && (
          <SharePage
            meme={finalMeme}
            onEditAgain={() => setStep('editor')}
            onRestart={reset}
          />
        )}
      </main>
    </div>
  )
}
