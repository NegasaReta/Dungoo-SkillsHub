const PATHS = {
  dashboard: 'M4 5h6v6H4V5Zm0 8h6v6H4v-6Zm8-8h8v6h-8V5Zm0 8h8v6h-8v-6Z',
  coach: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3 2',
  matching: 'M6 4v6m0 4v6M6 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12-6v4m0 4v8m0-12a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  analytics: 'M5 20V10m7 10V4m7 16v-7',
  resources: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13ZM13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13V4Z',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a8 8 0 0 0-2-1.2L15 3H9l-.5 2.6a8 8 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a8.2 8.2 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 2 1.2L9 21h6l.5-2.6a8 8 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.06-.4.1-.8.1-1.2Z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 5 5',
  bell: 'M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13 6 9Zm4 9a2 2 0 0 0 4 0',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2-11a2 2 0 1 1 3 1.7c-.6.4-1 .9-1 1.8m0 3h.01',
  spark: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z',
  play: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2-12.5 6 3.5-6 3.5v-7Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2',
  arrow: 'M5 12h14m-5-6 6 6-6 6',
  leaf: 'M5 19c0-7 5-12 14-13 0 9-4 14-11 14H5Zm0 0c1-4 3-6 6-7',
  menu: 'M4 7h16M4 12h16M4 17h16',
  logout: 'M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M9 8l-4 4 4 4m-4-4h10',
  check: 'M5 13l4 4L19 7',
  close: 'M6 6l12 12M18 6 6 18',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3',
  dots: 'M6 12h.01M12 12h.01M18 12h.01',
}

export default function NavIcon({ name, className = 'h-5 w-5' }) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
