import CodeMirror from '@uiw/react-codemirror';
import { sql, SQLite } from '@codemirror/lang-sql';
import { EditorView, keymap } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';
import { useMemo } from 'react';
import { Fingerprint } from 'lucide-react';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun?: () => void;
}

// Theme-aware shell. Colors come from the noir CSS variables, so the editor
// follows the active light/dark theme (no hardcoded palette).
const noirTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', color: 'var(--ink)', fontSize: '14px' },
  '.cm-content': {
    fontFamily: 'var(--font-mono)',
    caretColor: 'var(--brass-bright)',
    minHeight: '120px',
    padding: '12px 0',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg)',
    borderRight: '1px solid var(--line)',
    color: 'var(--ink-3)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'var(--panel)' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--brass) 6%, transparent)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--brass-glow) !important',
  },
  '.cm-cursor': { borderLeftColor: 'var(--brass-bright)' },
  '.cm-matchingBracket': {
    backgroundColor: 'var(--brass-glow)',
    outline: '1px solid var(--line-strong)',
  },
});

// SQL token colors per the design handoff: keyword=brass, function=oxblood,
// string=sage, number=lavender, comment=ink-3.
const noirHighlight = HighlightStyle.define([
  { tag: t.keyword, color: 'var(--brass-bright)', fontWeight: '600' },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.standard(t.function(t.variableName))], color: 'var(--oxblood)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--sage)' },
  { tag: [t.number, t.bool, t.null], color: '#c9a8e0' },
  { tag: [t.lineComment, t.blockComment], color: 'var(--ink-3)', fontStyle: 'italic' },
  { tag: t.operator, color: 'var(--ink-2)' },
  { tag: t.variableName, color: 'var(--ink)' },
]);

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
    <div className="editor-shell">
      <div className="editor-head">
        <div className="flex items-center gap-2">
          <Fingerprint size={15} className="text-brass" />
          <span className="mono uppercase text-ink-3 text-[11px] tracking-[0.12em]">consulta.sql</span>
        </div>
        <span className="mono text-ink-3 text-[10.5px]">⌘↵ executar</span>
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[
          sql({ dialect: SQLite }),
          syntaxHighlighting(noirHighlight),
          noirTheme,
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
        theme="none"
        minHeight="150px"
        maxHeight="300px"
      />
    </div>
  );
}
