export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0f1a',
          900: '#111827',
          800: '#1e293b',
          700: '#334155',
          500: '#64748b',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#0d9488',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
        },
        accent: {
          400: '#e8b86d',
          500: '#d4a017',
          600: '#b8860b',
          700: '#8b6914',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 10px 40px rgba(15, 23, 42, 0.08)',
        card: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        premium: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 30px rgba(10,15,26,0.08)',
        glow: '0 0 0 1px rgba(13,148,136,0.12), 0 12px 40px rgba(13,148,136,0.12)',
      },
    },
  },
  plugins: [],
}
