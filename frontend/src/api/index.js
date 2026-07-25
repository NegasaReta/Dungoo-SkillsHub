/**
 * Single entry point for API calls. The frontend runs against the localStorage
 * mock until the backend exists; set VITE_USE_MOCK_API=false to switch every
 * call over to the real FastAPI client without touching any component.
 */
import * as mockApi from './mockApi.js'
import * as httpApi from './client.js'

export const usingMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

const api = usingMockApi ? mockApi : httpApi

export const { signup, login, fetchMe, completeProfile, fetchOptions } = api

export { clearToken, getToken, setToken } from '../lib/token.js'
