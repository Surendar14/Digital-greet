import type { CSSProperties } from "react";

/** Minimal inline icon set (stroke-based, inherits currentColor). */
const PATHS: Record<string, React.ReactNode> = {
  play: <path d="M7 4.5v15l13-7.5z" />,
  pause: (
    <>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </>
  ),
  volume: (
    <>
      <path d="M4 9.5v5h3l4 3.5V6L7 9.5H4z" />
      <path d="M15 9a4.2 4.2 0 0 1 0 6M17.5 6.5a7 7 0 0 1 0 11" />
    </>
  ),
  mute: (
    <>
      <path d="M4 9.5v5h3l4 3.5V6L7 9.5H4z" />
      <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />
    </>
  ),
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  chevronLeft: <path d="M15 18l-6-6 6-6" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  chevronUp: <path d="M18 15l-6-6-6 6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  music: (
    <path d="M9 18.5V6l11-2v12.5M9 18.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM20 16.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
  ),
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  expand: <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  heartSpark: (
    <>
      <path d="M12 20.5s-7.5-4.4-7.5-9.6a3.6 3.6 0 0 1 7-1 3.6 3.6 0 0 1 7 1c0 5.2-6.5 9.6-6.5 9.6z" />
      <path d="M18.5 3.5l.6 1.7 1.7.6-1.7.6-.6 1.7-.6-1.7-1.7-.6 1.7-.6z" />
    </>
  ),
  prev: <path d="M7 4.5L7 19.5M7 12l14-7.5v15z" />,
  next: <path d="M17 4.5V19.5M17 12L3 4.5v15z" />,
  quote: <path d="M7.5 7.5c-2 1.4-3 3.4-3 6v3h5v-5H6.6c.2-1.3.9-2.3 2.1-3zM17.8 7.5c-2 1.4-3 3.4-3 6v3H20v-5h-2.6c.2-1.3.8-2.3 2-3z" />
};

export interface IconProps {
  name: keyof typeof PATHS;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, className, style }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}