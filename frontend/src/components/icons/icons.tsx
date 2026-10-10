// Iconos SVG copiados de la referencia de diseño. Todos son decorativos (aria-hidden).

interface IconProps {
  className?: string
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="2.2"
    >
      <circle cx="6" cy="5" r="2.5" />
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <path d="M6 7.5v9M18 10.5c0 4-6 3-12 6" />
    </svg>
  )
}

export function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="2.4"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function DiceIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="16" cy="8" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" />
    </svg>
  )
}

export function PodcastIcon() {
  return (
    <svg
      aria-hidden="true"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="1.9"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5v4M8.5 21.5h7" />
    </svg>
  )
}

export function NewsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="1.9"
    >
      <rect x="2.5" y="6.5" width="19" height="13" rx="2.5" />
      <path d="M8 2.5l4 4 4-4M6.5 15.5h7M17 11v0" />
    </svg>
  )
}

export function FootballIcon() {
  return (
    <svg
      aria-hidden="true"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="1.9"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5l4.2 3-1.6 5H9.4l-1.6-5zM12 2.5v5M21 9.5l-4.8 1M17.5 19.5l-2.9-4M6.5 19.5l2.9-4M3 9.5l4.8 1" />
    </svg>
  )
}

export function DocumentaryIcon() {
  return (
    <svg
      aria-hidden="true"
      width="34"
      height="34"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="1.9"
    >
      <circle cx="9" cy="9" r="4.5" />
      <circle cx="9" cy="9" r="1.3" />
      <path d="M13 12.5l8.5-3v6l-6-2M6 13.5l-2.5 8M12 13.5l2.5 8" />
    </svg>
  )
}

export function BroadcastIcon() {
  return (
    <svg
      aria-hidden="true"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="2.4"
    >
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path d="M7.5 7.5a6.4 6.4 0 000 9M16.5 7.5a6.4 6.4 0 010 9M4.3 4.3a11 11 0 000 15.4M19.7 4.3a11 11 0 010 15.4" />
    </svg>
  )
}

export function DownloadIcon() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      {...stroke}
      strokeWidth="2.2"
    >
      <path d="M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg aria-hidden="true" width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 3.5v17l14-8.5z" />
    </svg>
  )
}

export function PauseIcon() {
  return (
    <svg aria-hidden="true" width="40%" height="40%" viewBox="0 0 24 24" fill="currentColor">
      <rect x="5" y="3.5" width="5" height="17" rx="1" />
      <rect x="14" y="3.5" width="5" height="17" rx="1" />
    </svg>
  )
}

export function MicOffIcon() {
  return (
    <svg
      aria-hidden="true"
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18M9 4.5a3 3 0 016 .5v6M15 14.2A3 3 0 019 12.5V9M5.5 11a6.5 6.5 0 0010.6 5M18.5 11c0 .9-.2 1.8-.5 2.6M12 17.5v4M8.5 21.5h7" />
    </svg>
  )
}
