// Simple owl/robot mascot SVG — used as app identity mark
export default function MascotIcon({
  size = 24,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* head */}
      <rect x="4" y="4" width="16" height="13" rx="5" fill="currentColor" opacity="0.9" />
      {/* eyes */}
      <circle cx="9" cy="10" r="2.2" fill="white" />
      <circle cx="15" cy="10" r="2.2" fill="white" />
      <circle cx="9.6" cy="10.4" r="1" fill="#1A2315" />
      <circle cx="15.6" cy="10.4" r="1" fill="#1A2315" />
      {/* antenna */}
      <line x1="12" y1="4" x2="12" y2="1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="1.5" r="1" fill="currentColor" />
      {/* body / chin */}
      <rect x="9" y="16" width="6" height="4" rx="2" fill="currentColor" opacity="0.7" />
    </svg>
  )
}
