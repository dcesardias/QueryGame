import type { ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
  /** Color accent. Omit for the neutral (ink) chip. */
  variant?: 'brass' | 'ox' | 'sage';
  className?: string;
}

/**
 * Mono uppercase tag (concepts, labels). Always single-line (no wrap).
 */
export default function Chip({ children, variant, className }: ChipProps) {
  return (
    <span className={`chip${variant ? ` chip-${variant}` : ''}${className ? ` ${className}` : ''}`}>
      {children}
    </span>
  );
}
