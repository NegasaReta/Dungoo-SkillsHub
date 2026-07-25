import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { compressImage, getAvatar, removeAvatar, saveAvatar, validateImageFile } from '../lib/avatar.js'
import { useUser } from './UserContext.jsx'

const AvatarContext = createContext(null)

/**
 * Keeps the signed-in user's profile picture in one place so the topbar, the
 * sidebar, and the settings page all update the moment a new one is uploaded.
 */
export function AvatarProvider({ children }) {
  const { user } = useUser()
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    setAvatar(user ? getAvatar(user) : '')
  }, [user])

  const upload = useCallback(
    async (file) => {
      const invalid = validateImageFile(file)
      if (invalid) throw new Error(invalid)

      const dataUrl = await compressImage(file)
      if (!saveAvatar(user, dataUrl)) {
        throw new Error('This device is out of storage for images. Try a smaller photo.')
      }

      setAvatar(dataUrl)
      return dataUrl
    },
    [user]
  )

  const clear = useCallback(() => {
    removeAvatar(user)
    setAvatar('')
  }, [user])

  const value = useMemo(() => ({ avatar, upload, clear }), [avatar, upload, clear])

  return <AvatarContext.Provider value={value}>{children}</AvatarContext.Provider>
}

export function useAvatar() {
  const context = useContext(AvatarContext)
  if (!context) throw new Error('useAvatar must be used within an AvatarProvider')
  return context
}
