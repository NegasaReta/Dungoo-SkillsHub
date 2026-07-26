import NavIcon from '../app/NavIcon.jsx'
import Panel from '../dashboard/Panel.jsx'

const STEPS = {
  text: [
    {
      icon: 'message',
      title: 'Write it as you would send it',
      detail: 'A line from a real email, a stand-up update, or a message to a colleague.',
    },
    {
      icon: 'spark',
      title: 'Open the highlights',
      detail: 'Every change is marked in the corrected sentence. Click one to see why it changed.',
    },
    {
      icon: 'arrow',
      title: 'Answer the follow-up',
      detail: 'The coach keeps the thread going, so you practise in context instead of isolation.',
    },
  ],
  voice: [
    {
      icon: 'mic',
      title: 'Hold the button while you speak',
      detail: 'The mic stays shut between turns, so background noise cannot start a turn.',
    },
    {
      icon: 'audio',
      title: 'Listen for the correction',
      detail: 'The coach says your sentence back the natural way before replying to it.',
    },
    {
      icon: 'clock',
      title: 'Keep it conversational',
      detail: 'Short turns work best. Long monologues are harder to correct usefully.',
    },
  ],
}

const FOCUS = ['Grammar', 'Vocabulary', 'Tone']

export default function PracticeGuide({ mode }) {
  const steps = STEPS[mode] ?? STEPS.text

  return (
    <Panel className="h-full">
      <h2 className="text-base font-semibold text-primary">How this works</h2>
      <p className="mt-1 text-xs text-primary/60">
        {mode === 'voice' ? 'Spoken practice, corrected live.' : 'Written practice, corrected line by line.'}
      </p>

      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <NavIcon name={step.icon} className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[10px] font-semibold text-white">
                {index + 1}
              </span>
            </span>
            <div>
              <h3 className="text-sm font-semibold text-primary">{step.title}</h3>
              <p className="mt-0.5 text-xs leading-relaxed text-primary/55">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-5 border-t border-primary/10 pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary/40">
          What gets corrected
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FOCUS.map((item) => (
            <span
              key={item}
              className="rounded-full border border-primary/10 bg-surface px-3 py-1 text-xs font-medium text-primary/70"
            >
              {item}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-primary/50">
          Nothing here is scored or saved to your Skill Passport — this is practice space.
        </p>
      </div>
    </Panel>
  )
}
