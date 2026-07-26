import { useEffect, useRef, useState } from 'react'

import { sendPracticeMessage } from '../../api/practice.js'
import NavIcon from '../app/NavIcon.jsx'
import Loader from '../common/Loader.jsx'
import Panel from '../dashboard/Panel.jsx'
import MessageList from './MessageList.jsx'

export default function TextPractice() {
  const [turns, setTurns] = useState([])
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const idRef = useRef(0)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [turns, isSending])

  async function handleSubmit(event) {
    event.preventDefault()
    const message = draft.trim()
    if (!message || isSending) return

    // The follow-up is the conversational half of the coach's reply, so that is what the
    // history carries forward; corrected_text only restates what the user already said.
    const history = turns.map((turn) => ({
      role: turn.role,
      content: turn.role === 'user' ? turn.content : turn.coaching.follow_up,
    }))

    setTurns((current) => [...current, { id: (idRef.current += 1), role: 'user', content: message }])
    setDraft('')
    setError(null)
    setIsSending(true)

    try {
      const coaching = await sendPracticeMessage({ message, history })
      setTurns((current) => [
        ...current,
        { id: (idRef.current += 1), role: 'assistant', coaching },
      ])
    } catch (err) {
      // The API client flattens FastAPI's `detail` into `message` before rejecting.
      setError(err.message ?? 'Could not reach the coach. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <Panel className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-primary">Written practice</h2>
        {turns.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setTurns([])
              setError(null)
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary/60 transition-colors hover:bg-surface hover:text-primary"
          >
            <NavIcon name="close" className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 max-h-[26rem] flex-1 overflow-y-auto pr-1">
        <MessageList turns={turns} />

        {isSending && (
          <div className="mt-4">
            <Loader label="Coaching…" />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-relaxed text-danger">
          <NavIcon name="help" className="mt-px h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 border-t border-primary/10 pt-4">
        <label className="block">
          <span className="sr-only">Your message</span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="Type a sentence in English…"
            className="w-full resize-none rounded-xl border border-primary/15 bg-surface px-3.5 py-3 text-sm leading-relaxed text-primary outline-none transition-colors placeholder:text-primary/40 focus:border-brand-blue focus:bg-panel"
          />
        </label>

        <div className="mt-3 flex items-center justify-between gap-4">
          <p className="text-xs text-primary/45">Enter to send · Shift+Enter for a new line</p>
          <button
            type="submit"
            disabled={isSending || !draft.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-40"
          >
            <NavIcon name="arrow" className="h-4 w-4" />
            Send
          </button>
        </div>
      </form>
    </Panel>
  )
}
