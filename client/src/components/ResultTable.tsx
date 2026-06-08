import { XCircle } from 'lucide-react';
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
      <div className="qtable-wrap bad p-4">
        <div className="flex items-start gap-2.5">
          <XCircle size={16} className="text-oxblood mt-0.5 shrink-0" />
          <div>
            <div className="mono text-oxblood text-xs uppercase tracking-[0.1em] mb-1">Erro</div>
            <div className="muted text-[13.5px]">{result.error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (result.columns.length === 0) {
    return (
      <div className="qtable-wrap p-4">
        <div className="faint text-sm">Nenhuma linha retornada.</div>
      </div>
    );
  }

  const statusClass = highlight === 'success' ? 'ok' : highlight === 'error' ? 'bad' : '';
  const displayRows = result.rows.slice(0, maxRows);
  const hasMore = result.rows.length > maxRows;
  const rowLabel = `${result.rows.length} linha${result.rows.length !== 1 ? 's' : ''}`;

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <span className="kicker">{label}</span>
          <span className="faint mono text-[11px]">{rowLabel}</span>
        </div>
      )}
      <div className={`qtable-wrap ${statusClass}`} style={{ maxHeight: 320 }}>
        <table className="qtable">
          <thead>
            <tr>
              {result.columns.map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className={cell === null ? 'nullcell' : ''}>
                    {cell === null ? 'NULL' : String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="faint text-[11.5px] mt-1.5">
          … e mais {result.rows.length - maxRows} linhas
        </div>
      )}
    </div>
  );
}
