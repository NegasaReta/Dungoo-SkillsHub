import InfoPage, { ContactNote, InfoSections } from '../components/landing/InfoPage.jsx'
import { strings } from '../i18n/en.js'

export default function About() {
  const t = strings.pages.about

  return (
    <InfoPage eyebrow={t.eyebrow} title={t.title} lead={t.lead}>
      <InfoSections sections={t.sections} />
      <ContactNote />
    </InfoPage>
  )
}
