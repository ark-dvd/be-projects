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
        // Landscaping Contractor Branding - Earthy, Natural, Professional
        primary: {
          DEFAULT: '#2D5A3D', // Forest green
          50: '#E8F0EB',
          100: '#D1E1D7',
          200: '#A3C4AF',
          300: '#75A687',
          400: '#47895F',
          500: '#2D5A3D',
          600: '#244B32',
          700: '#1E3D29', // Primary dark - hover
          800: '#152E1E',
          900: '#0C1F13',
          950: '#06100A',
        },
        secondary: {
          DEFAULT: '#8B7355', // Earthy brown
          50: '#F5F2EF',
          100: '#EBE5DF',
          200: '#D7CBC0',
          300: '#C3B1A0',
          400: '#AF9780',
          500: '#8B7355',
          600: '#6F5C44',
          700: '#534533',
          800: '#372E22',
          900: '#1B1711',
          950: '#0E0B09',
        },
        accent: {
          DEFAULT: '#D4A84B', // Golden/amber for CTAs
          50: '#FBF6EB',
          100: '#F7EDD7',
          200: '#EFD9AF',
          300: '#E7C687',
          400: '#DFB35F',
          500: '#D4A84B',
          600: '#B8893A',
          700: '#8C692C',
          800: '#60491E',
          900: '#342810',
          950: '#1A1408',
        },
        light: {
          DEFAULT: '#F5F5F0', // Off-white/cream background
        },
        dark: {
          DEFAULT: '#1A1A1A', // Near black for text
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
