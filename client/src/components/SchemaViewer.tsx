import { useState } from 'react';
import { Database, ChevronDown, ChevronRight } from 'lucide-react';

interface TableSchema {
  name: string;
  note: string;
  columns: { name: string; type: string; pk?: boolean }[];
}

const INVESTIGATION_SCHEMA: TableSchema[] = [
  {
    name: 'suspects',
    note: 'Pessoas sob investigação',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'name', type: 'TEXT' },
      { name: 'age', type: 'INTEGER' },
      { name: 'city', type: 'TEXT' },
      { name: 'occupation', type: 'TEXT' },
      { name: 'criminal_record', type: 'INTEGER' },
      { name: 'registered_at', type: 'TEXT' },
    ],
  },
  {
    name: 'crimes',
    note: 'Ocorrências registradas',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'type', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'date', type: 'TEXT' },
      { name: 'financial_loss', type: 'REAL' },
      { name: 'solved', type: 'INTEGER' },
    ],
  },
  {
    name: 'suspect_crimes',
    note: 'Vínculos suspeito–ocorrência',
    columns: [
      { name: 'suspect_id', type: 'INTEGER', pk: true },
      { name: 'crime_id', type: 'INTEGER', pk: true },
      { name: 'role', type: 'TEXT' },
    ],
  },
  {
    name: 'evidence',
    note: 'Provas coletadas em campo',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'crime_id', type: 'INTEGER' },
      { name: 'type', type: 'TEXT' },
      { name: 'description', type: 'TEXT' },
      { name: 'found_at', type: 'TEXT' },
      { name: 'importance', type: 'TEXT' },
    ],
  },
  {
    name: 'detectives',
    note: 'Agentes da DIA',
    columns: [
      { name: 'id', type: 'INTEGER', pk: true },
      { name: 'name', type: 'TEXT' },
      { name: 'rank', type: 'TEXT' },
      { name: 'cases_solved', type: 'INTEGER' },
      { name: 'hire_date', type: 'TEXT' },
    ],
  },
  {
    name: 'case_assignments',
    note: 'Designações de agentes',
    columns: [
      { name: 'detective_id', type: 'INTEGER', pk: true },
      { name: 'crime_id', type: 'INTEGER', pk: true },
      { name: 'assigned_at', type: 'TEXT' },
    ],
  },
];

export default function SchemaViewer() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (name: string) =>
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  return (
    <div className="rounded-[14px] border border-line bg-panel p-4">
      <div className="flex items-center gap-2 mb-3">
        <Database size={15} className="text-brass" />
        <span className="eyebrow">Arquivo de dados</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {INVESTIGATION_SCHEMA.map(table => {
          const isOpen = !!expanded[table.name];
          return (
            <div key={table.name} className="overflow-hidden rounded-lg border border-line bg-panel-2">
              <button
                onClick={() => toggle(table.name)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="mono text-[13px] font-semibold text-brass-bright">{table.name}</span>
                  <span className="faint text-[11px] truncate">{table.note}</span>
                </span>
                {isOpen ? (
                  <ChevronDown size={14} className="text-ink-3 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-ink-3 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-0.5">
                  {table.columns.map(col => (
                    <span
                      key={col.name}
                      title={`${col.type}${col.pk ? ' · PK' : ''}`}
                      className={`mono rounded-[5px] border border-line bg-bg-deep px-[7px] py-0.5 text-[11px] ${
                        col.pk ? 'text-brass' : 'text-ink-2'
                      }`}
                    >
                      {col.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
