export default function RoleSelect({ roles = [], value, onChange }) {
  return (
    <select
      className="rounded-lg border border-primary/20 bg-panel px-3 py-2 text-primary outline-none transition-colors focus:border-brand-blue"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="" disabled>
        Select a role
      </option>
      {roles.map((role) => (
        <option key={role.slug} value={role.slug}>
          {role.label}
        </option>
      ))}
    </select>
  )
}
