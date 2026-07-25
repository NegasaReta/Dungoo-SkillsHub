export default function RoleSelect({ roles = [], value, onChange }) {
  return (
    <select
      className="rounded-lg border border-slate-300 px-3 py-2"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    >
      <option value="" disabled>
        Select a role
      </option>
      {roles.map((role) => (
        <option key={role} value={role}>
          {role}
        </option>
      ))}
    </select>
  )
}
