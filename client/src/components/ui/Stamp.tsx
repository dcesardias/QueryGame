import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StampProps {
  label: string;
  /** 'solved' = sage, 'priority' = oxblood. */
  kind?: 'solved' | 'priority';
  /** Play the stamp-in entrance animation (scale + overshoot). */
  animate?: boolean;
  /** Lucide icon shown before the label. Defaults to a check mark. */
  icon?: LucideIcon;
}

/**
 * Case-file stamp — a rotated, outlined label in the noir palette.
 */
export default function Stamp({ label, kind = 'solved', animate = false, icon: Icon = Check }: StampProps) {
  return (
    <span className={`stamp stamp-${kind}${animate ? ' animate-stamp-in' : ''}`}>
      <Icon size={14} strokeWidth={2.4} />
      {label}
    </span>
  );
}
