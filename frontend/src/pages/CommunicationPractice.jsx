import { useState } from 'react'
import ModeToggle from '../components/practice/ModeToggle.jsx'
import TextPractice from '../components/practice/TextPractice.jsx'
import VoicePractice from '../components/practice/VoicePractice.jsx'

export default function CommunicationPractice() {
  const [mode, setMode] = useState('text')

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Communication Practice</h1>
      <p className="mt-1 text-sm text-slate-600">
        Practice professional English and get corrections on grammar, vocabulary, and tone.
      </p>

      <div className="mt-4">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="mt-6 max-w-2xl">
        {mode === 'text' ? <TextPractice /> : <VoicePractice />}
      </div>
    </main>
  )
}
