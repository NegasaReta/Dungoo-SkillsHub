import InfoPage, { ContactNote, InfoSections } from '../components/landing/InfoPage.jsx'
import { strings } from '../i18n/en.js'

export default function Privacy() {
  const t = strings.pages.privacy

  return (
    <InfoPage eyebrow={t.eyebrow} title={t.title} lead={t.lead} updated={strings.pages.updated}>
      <InfoSections sections={t.sections} />
      <ContactNote />
    </InfoPage>
  )
}
