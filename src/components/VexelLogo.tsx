export function VexelLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vexel Launcher"
    >
      <defs>
        <linearGradient id="vxg-top" x1="10" y1="4" x2="36" y2="16" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A7F3D0" />
          <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="vxg-left" x1="10" y1="16" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#059669" />
          <stop offset="1" stopColor="#064E3B" />
        </linearGradient>
        <linearGradient id="vxg-right" x1="38" y1="16" x2="24" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#065F46" />
        </linearGradient>
      </defs>

      {/* Top diamond face */}
      <path d="M24 2 41 11.25 24 20.5 7 11.25 24 2Z" fill="url(#vxg-top)" />
      {/* Left face */}
      <path d="M7 11.25 24 20.5V42.75L7 33.5V11.25Z" fill="url(#vxg-left)" />
      {/* Right face */}
      <path d="M41 11.25 24 20.5V42.75L41 33.5V11.25Z" fill="url(#vxg-right)" />

      {/* V notch on the top face */}
      <path
        d="M16.5 8.9 24 13.1 31.5 8.9"
        stroke="#022C22"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Edge highlights */}
      <path d="M24 20.5 41 11.25M24 20.5 7 11.25" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M24 20.5V42.75" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M24 2 41 11.25 24 20.5 7 11.25 24 2Z" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="0.9" strokeLinejoin="round" fill="none" />
    </svg>
  );
}
