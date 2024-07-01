import type { Config } from 'tailwindcss'
import { themeProps } from './lib/telegram/constants'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'tg-divider': themeProps.secondary_bg_color,
        'tg-accent': themeProps.accent_text_color,
        'tg-secondary': themeProps.subtitle_text_color,
      },
    },
  },
  plugins: [],
}
export default config
