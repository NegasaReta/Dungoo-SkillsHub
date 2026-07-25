import { useEffect, useRef, useState } from 'react'
import { sendPracticeMessage } from '../../api/practice.js'
import Button from '../common/Button.jsx'
import Loader from '../common/Loader.jsx'
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
      setError(err.response?.data?.detail ?? 'Could not reach the coach. Please try again.')
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
    <div>
      <MessageList turns={turns} />

      {isSending ? (
        <div className="mt-3">
          <Loader label="Coaching…" />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <div ref={endRef} />

      <form onSubmit={handleSubmit} className="mt-4 flex items-end gap-2">
        <label className="flex-1">
          <span className="sr-only">Your message</span>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Type a sentence in English… (Enter to send, Shift+Enter for a new line)"
            className="w-full resize-none rounded-lg border border-slate-200 p-2 text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <Button type="submit" disabled={isSending || !draft.trim()}>
          Send
        </Button>
      </form>
    </div>
  )
}
