const TOKEN_KEY = 'dungoo.access_token'

/** Raised by the API client when the server rejects the stored token. */
export const SESSION_EXPIRED_EVENT = 'dungoo:session-expired'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
