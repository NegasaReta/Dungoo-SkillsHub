import { usingMockApi } from '../api/index.js'
import ApiPassport from '../components/passport/ApiPassport.jsx'
import LocalPassport from '../components/passport/LocalPassport.jsx'

/**
 * Two passports for two data sources. The backend scores finished sessions and
 * serves GET /passport; mock mode has no such endpoint, so it derives the same
 * picture from the session history kept in localStorage.
 */
export default function SkillPassport() {
  return usingMockApi ? <LocalPassport /> : <ApiPassport />
}
