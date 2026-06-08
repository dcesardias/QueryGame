interface BarProps {
  value: number;
  max: number;
  /** Use the sage (success) gradient instead of brass. */
  sage?: boolean;
  className?: string;
}

/**
 * Thin progress bar (XP, missions). Brass gradient by default, sage variant
 * for success/solved progress.
 */
export default function Bar({ value, max, sage = false, className }: BarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`bar${sage ? ' sage' : ''}${className ? ` ${className}` : ''}`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
