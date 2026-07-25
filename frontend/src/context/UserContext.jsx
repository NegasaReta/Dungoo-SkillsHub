import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  clearToken,
  fetchMe,
  getToken,
  login as loginRequest,
  setToken,
  signup as signupRequest,
} from '../api/index.js'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  // Only block the first paint when there is a token worth verifying.
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return undefined

    let cancelled = false
    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(me)
      })
      .catch(() => {
        // Expired or rejected token: drop it and fall back to the signed-out UI.
        if (!cancelled) clearToken()
      })
      .finally(() => {
        if (!cancelled) setBootstrapping(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Signup and login only return the token, so the full user is read back from
  // /auth/me to keep a single shape for `user` everywhere.
  const authenticate = useCallback(async (request) => {
    const { access_token: accessToken } = await request()
    setToken(accessToken)
    try {
      const me = await fetchMe()
      setUser(me)
      return me
    } catch (error) {
      clearToken()
      throw error
    }
  }, [])

  const signup = useCallback(
    (details) => authenticate(() => signupRequest(details)),
    [authenticate]
  )

  const login = useCallback(
    (email, password) => authenticate(() => loginRequest(email, password)),
    [authenticate]
  )

  const refresh = useCallback(async () => {
    const me = await fetchMe()
    setUser(me)
    return me
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      setUser,
      bootstrapping,
      isAuthenticated: Boolean(user),
      profileCompleted: Boolean(user?.profile_completed),
      signup,
      login,
      logout,
      refresh,
    }),
    [user, bootstrapping, signup, login, logout, refresh]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}
