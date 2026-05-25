import type { Config } from 'tailwindcss'
import fontFamily from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.fontFamily.mono],
      },
    },
  },
  plugins: [],
}

export default config
