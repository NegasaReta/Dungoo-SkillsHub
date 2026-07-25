import { useState } from 'react'

import AppShell from '../components/app/AppShell.jsx'
import ModeToggle from '../components/practice/ModeToggle.jsx'
import TextPractice from '../components/practice/TextPractice.jsx'
import VoicePractice from '../components/practice/VoicePractice.jsx'
import { strings } from '../i18n/en.js'

const copy = strings.practice

export default function CommunicationPractice() {
  const [mode, setMode] = useState('text')

  return (
    <AppShell>
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-blue">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-primary">{copy.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-primary/60">{copy.subtitle}</p>
        </div>

        <ModeToggle mode={mode} onChange={setMode} />

        <div className="max-w-2xl">
          {mode === 'text' ? <TextPractice /> : <VoicePractice />}
        </div>
      </div>
    </AppShell>
  )
}
