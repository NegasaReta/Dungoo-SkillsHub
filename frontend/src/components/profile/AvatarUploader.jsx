import { useRef, useState } from 'react'

import { useAvatar } from '../../context/AvatarContext.jsx'
import { useUser } from '../../context/UserContext.jsx'
import { strings } from '../../i18n/en.js'
import NavIcon from '../app/NavIcon.jsx'
import FormAlert from '../auth/FormAlert.jsx'
import Avatar from '../common/Avatar.jsx'

export default function AvatarUploader() {
  const { user } = useUser()
  const { avatar, upload, clear } = useAvatar()
  const inputRef = useRef(null)

  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file) {
    setError('')
    setStatus('')
    setBusy(true)
    try {
      await upload(file)
      setStatus(strings.settings.photoSaved)
    } catch (cause) {
      setError(cause.message)
    } finally {
      setBusy(false)
    }
  }

  function handleDrop(event) {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4">
      <FormAlert>{error}</FormAlert>
      {status && <FormAlert tone="success">{status}</FormAlert>}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-wrap items-center gap-5 rounded-2xl border border-dashed p-4 transition-colors ${
          dragging ? 'border-brand-blue bg-brand-blue/5' : 'border-primary/15'
        }`}
      >
        <div className="relative">
          <Avatar user={user} src={avatar} size="lg" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label={avatar ? strings.settings.photoReplace : strings.settings.photoUpload}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white ring-2 ring-panel transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
          >
            <NavIcon name="camera" className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-primary/70">{strings.settings.photoBody}</p>
          <p className="mt-1 text-xs text-primary/50">{strings.settings.photoHint}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-blue/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy
                ? '…'
                : avatar
                  ? strings.settings.photoReplace
                  : strings.settings.photoUpload}
            </button>

            {avatar && (
              <button
                type="button"
                onClick={() => {
                  clear()
                  setError('')
                  setStatus(strings.settings.photoRemoved)
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-primary/15 px-3 py-2 text-sm font-medium text-primary/70 transition-colors hover:bg-surface hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <NavIcon name="trash" className="h-4 w-4" />
                {strings.settings.photoRemove}
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // Reset so picking the same file twice still fires a change event.
          event.target.value = ''
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
