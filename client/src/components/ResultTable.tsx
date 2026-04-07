import type { QueryResult } from '../types';

interface ResultTableProps {
  result: QueryResult;
  label?: string;
  maxRows?: number;
  highlight?: 'success' | 'error' | 'neutral';
}

export default function ResultTable({ result, label, maxRows = 50, highlight = 'neutral' }: ResultTableProps) {
  if (result.error) {
    return (
      <div className="rounded-lg bg-neon-red/5 border border-neon-red/20 p-4">
        <div className="text-neon-red text-sm font-mono">{result.error}</div>
      </div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <div className="rounded-lg bg-surface border border-white/5 p-4">
        <div className="text-text-muted text-sm">Nenhum resultado retornado.</div>
      </div>
    );
  }

  const borderColor = highlight === 'success'
    ? 'border-neon-green/30'
    : highlight === 'error'
      ? 'border-neon-red/30'
      : 'border-white/5';

  const displayRows = result.rows.slice(0, maxRows);
  const hasMore = result.rows.length > maxRows;

  return (
    <div className={`rounded-lg border ${borderColor} overflow-hidden`}>
      {label && (
        <div className={`px-3 py-1.5 text-xs font-medium border-b ${borderColor} ${
          highlight === 'success' ? 'bg-neon-green/5 text-neon-green' :
          highlight === 'error' ? 'bg-neon-red/5 text-neon-red' :
          'bg-surface text-text-secondary'
        }`}>
          {label} ({result.rows.length} linha{result.rows.length !== 1 ? 's' : ''})
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="bg-bg-primary/50">
              {result.columns.map((col, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs text-neon-cyan font-medium border-b border-white/5">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02] border-b border-white/[0.03] last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-1.5 text-text-primary whitespace-nowrap">
                    {cell === null ? (
                      <span className="text-text-muted italic">NULL</span>
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="px-3 py-1.5 text-xs text-text-muted border-t border-white/5">
          ... e mais {result.rows.length - maxRows} linhas
        </div>
      )}
    </div>
  );
}
