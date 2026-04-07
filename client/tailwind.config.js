/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0e1a',
        'bg-secondary': '#111827',
        'surface': '#1e293b',
        'surface-hover': '#334155',
        'neon-cyan': '#00f0ff',
        'neon-magenta': '#ff00aa',
        'neon-green': '#00ff88',
        'neon-gold': '#ffd700',
        'neon-red': '#ff4757',
        'neon-orange': '#ff6b35',
        'text-primary': '#e2e8f0',
        'text-secondary': '#94a3b8',
        'text-muted': '#64748b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.3)',
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.3)',
        'neon-magenta': '0 0 15px rgba(255, 0, 170, 0.3)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.3)',
        'neon-red': '0 0 15px rgba(255, 71, 87, 0.3)',
      },
      animation: {
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        'float-up': 'floatUp 1s ease-out forwards',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
