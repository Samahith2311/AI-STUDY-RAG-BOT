import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        sage: '#EFF8F3',
        primary: {
          DEFAULT: '#7ED348',
          dark: '#5ABF35',
        },
        ink: '#1A2315',
        muted: '#6B7280',
        accent: {
          purple: '#8B5CF6',
          amber: '#F59E0B',
        },
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(0,0,0,0.06)',
        'card-lg': '0 4px 24px 0 rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}

export default config
