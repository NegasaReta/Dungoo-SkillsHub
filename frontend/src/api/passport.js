import client from './client.js'

// Keep this local — importing from ./index.js would create a circular dependency.
const usingMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

/**
 * The signed-in user's credential. Scoped to the token, so there is no user id to
 * pass: the passport a request gets back is always the caller's own.
 */
export async function fetchPassport() {
  if (usingMockApi) {
    throw new Error(
      'The Skill Passport needs the live backend. Set VITE_USE_MOCK_API=false in frontend/.env.local, restart the dev server, and sign in again.'
    )
  }

  const { data } = await client.get('/passport/me')
  return data
}
