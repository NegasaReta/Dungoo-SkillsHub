const LANGUAGES = ['Amharic', 'Afaan Oromoo', 'Tigrinya', 'English']

export default function Footer() {
  return (
    <footer className="border-t border-primary/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue font-bold text-white">
                D
              </span>
              <span className="font-semibold text-primary">
                Dungoo <span className="text-brand-blue">SkillsHub</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-primary/60">
              AI-powered career readiness for Ethiopian youth. A product of Dungoo Software
              Solutions.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">Available in</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary/60">
              {LANGUAGES.map((language) => (
                <li key={language}>{language}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-primary">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary/60">
              <li>
                <a href="#how-it-works" className="hover:text-brand-blue">
                  How it works
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-blue">
                  Features
                </a>
              </li>
              <li>
                <a href="#passport" className="hover:text-brand-blue">
                  Skill Passport
                </a>
              </li>
              <li>
                <a href="#why" className="hover:text-brand-blue">
                  Why Dungoo
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-primary/10 pt-6 text-sm text-primary/50">
          © {new Date().getFullYear()} Dungoo Software Solutions. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
