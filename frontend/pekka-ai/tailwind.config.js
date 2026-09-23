/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ops: {
          bg: '#0B1310',
          surface: '#10201A',
          card: '#10201A',
          cardHover: '#152B23',
          border: '#2A3B32',
          borderBright: 'rgba(201, 162, 39, 0.35)',
          textMuted: '#708778',
          textDim: '#B8C4BA',
          textBright: '#F2EDE0',
        },
        gold: {
          primary: '#C9A227',
          neon: '#C9A227',
          dim: '#A3801A',
          glow: 'rgba(201, 162, 39, 0.28)',
          subtle: 'rgba(201, 162, 39, 0.08)',
        },
        sage: {
          DEFAULT: '#8FBFA3',
          accent: '#8FBFA3',
          dim: '#6E9A81',
          glow: 'rgba(143, 191, 163, 0.25)',
          subtle: 'rgba(143, 191, 163, 0.08)',
        },
        emerald: {
          deep: '#3E7A4F',
          dark: '#10201A',
        },
        /* Aliased cyan tokens to Antique Gold for full palette transformation */
        cyan: {
          neon: '#C9A227',
          glow: 'rgba(201, 162, 39, 0.28)',
          dim: '#A3801A',
          subtle: 'rgba(201, 162, 39, 0.08)',
        },
        amber: {
          ops: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)',
          subtle: 'rgba(245, 158, 11, 0.08)',
        },
        red: {
          ops: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.3)',
          subtle: 'rgba(239, 68, 68, 0.1)',
        },
        green: {
          ops: '#3E7A4F',
          glow: 'rgba(62, 122, 79, 0.25)',
          subtle: 'rgba(62, 122, 79, 0.08)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
