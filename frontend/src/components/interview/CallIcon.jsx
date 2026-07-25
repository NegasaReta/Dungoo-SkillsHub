const PATHS = {
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3',
  micOff: 'M9 6a3 3 0 0 1 6 0v5m-6 1v-1m-3 0a6 6 0 0 0 9.5 4.9M12 18v3M4 4l16 16',
  camera: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h7A1.5 1.5 0 0 1 14 7.5v9A1.5 1.5 0 0 1 12.5 18h-7A1.5 1.5 0 0 1 4 16.5v-9ZM14 11l6-3.5v9L14 13',
  cameraOff: 'M14 11l6-3.5v9l-3-1.7M4 7.5A1.5 1.5 0 0 1 5.5 6h5m3.5 1.5v9A1.5 1.5 0 0 1 12.5 18h-7A1.5 1.5 0 0 1 4 16.5v-4M4 4l16 16',
  leave: 'M5 4h5l2 4-2.5 1.5a10 10 0 0 0 5 5L16 12l4 2v5a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Zm10 2 5 5m0-5-5 5',
  captions: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-11ZM8 10.5h2.5M8 13.5h4m3.5-3H17m-4 3h4',
}

export default function CallIcon({ name, className = 'h-5 w-5' }) {
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
