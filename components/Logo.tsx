export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="url(#logo-bg)" />
      {/* Stylized "M" letterform */}
      <path
        d="M16 44V20h2.5l13.5 17 13.5-17H48v24h-6V30.5L32 43h-1L20.5 30.5V44H16Z"
        fill="white"
        opacity="0.95"
      />
      {/* Accent dot — represents influence/reach */}
      <circle cx="50" cy="15" r="5.5" fill="#FBBF24" />
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  )
}
