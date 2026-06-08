/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- Noir design tokens (backed by CSS variables in index.css) ----
        // These swap with [data-theme] so light/dark share the same class names.
        // Solid tokens use relative-color syntax so Tailwind opacity modifiers
        // (e.g. `bg-brass/30`) resolve against the hex var. `line`/`line-strong`
        // already carry their own alpha, so they stay as plain var() references.
        bg: 'rgb(from var(--bg) r g b / <alpha-value>)',
        'bg-deep': 'rgb(from var(--bg-deep) r g b / <alpha-value>)',
        panel: 'rgb(from var(--panel) r g b / <alpha-value>)',
        'panel-2': 'rgb(from var(--panel-2) r g b / <alpha-value>)',
        'panel-raised': 'rgb(from var(--panel-raised) r g b / <alpha-value>)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        ink: 'rgb(from var(--ink) r g b / <alpha-value>)',
        'ink-2': 'rgb(from var(--ink-2) r g b / <alpha-value>)',
        'ink-3': 'rgb(from var(--ink-3) r g b / <alpha-value>)',
        brass: 'rgb(from var(--brass) r g b / <alpha-value>)',
        'brass-bright': 'rgb(from var(--brass-bright) r g b / <alpha-value>)',
        'brass-deep': 'rgb(from var(--brass-deep) r g b / <alpha-value>)',
        oxblood: 'rgb(from var(--oxblood) r g b / <alpha-value>)',
        'oxblood-deep': 'rgb(from var(--oxblood-deep) r g b / <alpha-value>)',
        sage: 'rgb(from var(--sage) r g b / <alpha-value>)',
        'sage-deep': 'rgb(from var(--sage-deep) r g b / <alpha-value>)',
      },
      fontFamily: {
        display: ['Spectral', 'Georgia', 'serif'],
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        lift: 'var(--shadow-lift)',
      },
      animation: {
        'stamp-in': 'stampIn 0.5s cubic-bezier(.2,1.3,.4,1) forwards',
        'fade-up': 'fadeUp 0.5s ease',
      },
      keyframes: {
        stampIn: {
          '0%': { transform: 'rotate(-7deg) scale(2.6)', opacity: '0' },
          '60%': { opacity: '1' },
          '100%': { transform: 'rotate(-7deg) scale(1)', opacity: '0.92' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
    },
  },
  plugins: [],
}
