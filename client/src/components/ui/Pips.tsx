interface PipsProps {
  /** Number of filled pips. */
  level: number;
  /** Total pips rendered. */
  max?: number;
  /** Use the oxblood (boss) color for filled pips. */
  ox?: boolean;
}

/**
 * Difficulty pips (1–5 dots). Filled pips are brass, or oxblood for bosses.
 */
export default function Pips({ level, max = 5, ox = false }: PipsProps) {
  return (
    <span className="pips" title={`Dificuldade ${level}/${max}`}>
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`pip${i < level ? ' on' : ''}${ox ? ' ox' : ''}`} />
      ))}
    </span>
  );
}
