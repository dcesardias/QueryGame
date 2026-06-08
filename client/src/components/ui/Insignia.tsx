interface InsigniaProps {
  /** Number of brass chevrons (0–4). 0 renders the single recruit dot. */
  chevrons?: number;
  /** Rendered size in px (square). */
  size?: number;
  className?: string;
}

/**
 * Rank insignia — a brass shield with 0–4 chevrons.
 * Replaces the old emoji rank icons. Colors come from the noir CSS variables,
 * so it follows the active light/dark theme automatically.
 */
export default function Insignia({ chevrons = 0, size = 38, className }: InsigniaProps) {
  const count = Math.max(0, Math.min(4, chevrons));
  return (
    <span className={`insignia${className ? ` ${className}` : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id="qg-brass-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--brass-bright)" />
            <stop offset="1" stopColor="var(--brass-deep)" />
          </linearGradient>
        </defs>
        {/* Outer shield outline */}
        <path
          d="M20 2 L35 7 V19 C35 29 28 35 20 38 C12 35 5 29 5 19 V7 Z"
          fill="none"
          stroke="url(#qg-brass-grad)"
          strokeWidth={2}
        />
        {/* Inner field */}
        <path
          d="M20 6 L31 10 V19 C31 26.5 25.5 31.5 20 34 C14.5 31.5 9 26.5 9 19 V10 Z"
          fill="var(--brass-glow)"
        />
        {count === 0 ? (
          <circle cx={20} cy={19} r={3.4} fill="var(--brass-bright)" />
        ) : (
          Array.from({ length: count }).map((_, i) => (
            <path
              key={i}
              d={`M13 ${24 - i * 5} L20 ${20 - i * 5} L27 ${24 - i * 5}`}
              fill="none"
              stroke="var(--brass-bright)"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))
        )}
      </svg>
    </span>
  );
}
