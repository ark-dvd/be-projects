import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BE Project Solutions Brand Colors
        primary: {
          DEFAULT: '#1E3A22', // Dark green - dominant brand color
          50: '#f0f5f1',
          100: '#d1e2d5',
          200: '#a3c5ab',
          300: '#75a881',
          400: '#4f8a5d',
          500: '#367040',
          600: '#2a5630',
          700: '#152B19', // Darker for hover states
          800: '#0F2012',
          900: '#0A170C',
          950: '#050C06',
        },
        secondary: {
          DEFAULT: '#5B5B5C', // Neutral dark gray - body text, icons
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#b2b2b3',
          400: '#999999',
          500: '#5B5B5C',
          600: '#4a4a4b',
          700: '#393939',
          800: '#272728',
          900: '#161616',
          950: '#0b0b0b',
        },
        accent: {
          DEFAULT: '#8DBE23', // Bright green - CTAs, buttons, highlights
          50: '#f7fae9',
          100: '#ecf3cc',
          200: '#d9e89b',
          300: '#c5dc69',
          400: '#a9ce3e',
          500: '#8DBE23',
          600: '#71981C', // Hover state
          700: '#557216',
          800: '#394c0f',
          900: '#1d2608',
          950: '#0f1304',
        },
        light: {
          DEFAULT: '#F4F4F4', // Off-white background
        },
        dark: {
          DEFAULT: '#1E3A22', // Dark green for headings & primary text
        },
      },
      fontFamily: {
        heading: ['var(--font-montserrat)', 'Montserrat', 'system-ui', 'sans-serif'],
        body: ['var(--font-open-sans)', 'Open Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
