import NavIcon from '../app/NavIcon.jsx'

export default function InviteCard() {
  return (
    <section className="lift flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-primary/20 bg-panel p-5 text-center shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-link">
        <NavIcon name="plus" className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-primary">Missing someone?</h3>
      <p className="mt-1 text-sm text-primary/60">
        Invite friends to practice interviews together.
      </p>
      <button
        type="button"
        className="mt-5 rounded-lg border border-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface"
      >
        Invite friends
      </button>
    </section>
  )
}
