import { useState } from 'react';
import { Database, ChevronDown, ChevronRight } from 'lucide-react';

interface TableSchema {
  name: string;
  columns: { name: string; type: string; pk?: boolean }[];
}

const INVESTIGATION_SCHEMA: TableSchema[] = [
  {
    name: 'suspects',
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
    columns: [
      { name: 'suspect_id', type: 'INTEGER', pk: true },
      { name: 'crime_id', type: 'INTEGER', pk: true },
      { name: 'role', type: 'TEXT' },
    ],
  },
  {
    name: 'evidence',
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
    <div className="card bg-bg-secondary border-white/5">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-4 h-4 text-neon-cyan" />
        <h3 className="text-sm font-semibold text-text-primary">Schema do Banco</h3>
      </div>
      <div className="space-y-1">
        {INVESTIGATION_SCHEMA.map(table => (
          <div key={table.name}>
            <button
              onClick={() => toggle(table.name)}
              className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              {expanded[table.name] ? (
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              )}
              <span className="text-sm font-mono text-neon-cyan">{table.name}</span>
            </button>
            {expanded[table.name] && (
              <div className="ml-6 mt-0.5 mb-1 space-y-0.5">
                {table.columns.map(col => (
                  <div key={col.name} className="flex items-center gap-2 text-xs font-mono px-2 py-0.5">
                    <span className={col.pk ? 'text-neon-gold' : 'text-text-primary'}>
                      {col.name}
                    </span>
                    <span className="text-text-muted">{col.type}</span>
                    {col.pk && <span className="text-neon-gold text-[10px]">PK</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
