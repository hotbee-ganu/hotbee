/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hotbee: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde047',
          300: '#facc15',
          400: '#eab308',
          500: '#ff9d00', // Primary Amber Gold from logo
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          accent: '#ffb800',
          yellow: '#ffd000',
          dark: '#060709',
          darker: '#0a0c10',
          carbon: '#0e1118',
          surface: '#12151e',
          'surface-light': '#181c28',
          glass: 'rgba(18, 21, 30, 0.72)',
          'glass-hover': 'rgba(28, 33, 48, 0.82)',
          'glass-border': 'rgba(255, 157, 0, 0.18)',
          'glass-light': 'rgba(255, 255, 255, 0.04)',
          hairline: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['var(--font-jakarta)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(255, 157, 0, 0.45)',
        'glow-gold-lg': '0 0 45px -5px rgba(255, 157, 0, 0.65)',
        'glow-subtle': '0 10px 30px -10px rgba(255, 157, 0, 0.25)',
        'glow-amber-sm': '0 0 15px rgba(255, 157, 0, 0.35)',
        'glass': '0 12px 35px -8px rgba(0, 0, 0, 0.65)',
        'card-elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 157, 0, 0.15)',
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.85, transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      animation: {
        'pulse-slow': 'pulseSlow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 5s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      }
    },
  },
  plugins: [],
}
