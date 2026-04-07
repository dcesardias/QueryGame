interface XpBarProps {
  current: number;
  max: number;
  className?: string;
  showLabel?: boolean;
}

export default function XpBar({ current, max, className = '', showLabel = false }: XpBarProps) {
  const pct = Math.min(100, (current / max) * 100);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="h-2 bg-bg-primary rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #00f0ff, #ff00aa)',
            boxShadow: '0 0 8px rgba(0, 240, 255, 0.4)',
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-muted">
          {current} / {max} XP
        </span>
      )}
    </div>
  );
}
