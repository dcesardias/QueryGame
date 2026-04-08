import CodeMirror from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { useMemo } from 'react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
}

const theme = EditorView.theme({
  '&': {
    backgroundColor: '#111827',
    fontSize: '14px',
    borderRadius: '0.75rem',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    caretColor: '#00f0ff',
    minHeight: '120px',
    padding: '12px 0',
  },
  '.cm-gutters': {
    backgroundColor: '#0a0e1a',
    borderRight: '1px solid #1e293b',
    color: '#64748b',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1e293b',
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 240, 255, 0.03)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(0, 240, 255, 0.15) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'rgba(0, 240, 255, 0.15) !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#00f0ff',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    outline: '1px solid rgba(0, 240, 255, 0.3)',
  },
}, { dark: true });

export default function SqlEditor({ value, onChange, onRun }: SqlEditorProps) {
  const runKeymap = useMemo(
    () =>
      Prec.highest(
        keymap.of([
          {
            key: 'Ctrl-Enter',
            run: () => {
              onRun?.();
              return true;
            },
          },
          {
            key: 'Mod-Enter',
            run: () => {
              onRun?.();
              return true;
            },
          },
        ])
      ),
    [onRun]
  );

  return (
    <div className="relative">
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[
          sql({ dialect: SQLite }),
          theme,
          EditorView.lineWrapping,
          runKeymap,
        ]}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          foldGutter: false,
          highlightActiveLineGutter: true,
        }}
        theme="dark"
        minHeight="150px"
        maxHeight="300px"
      />
      <div className="absolute bottom-2 right-2 text-xs text-text-muted">
        Ctrl+Enter para executar
      </div>
    </div>
  );
}
