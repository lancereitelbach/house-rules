/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          100: '#f8f7f4',
          200: '#e8e6df',
          300: '#d4d1c7',
        },
        ink: {
          900: '#2b2822',
          700: '#4a4540',
          500: '#6b6560',
        },
        felt: {
          base: '#3d4f3a',
          light: '#4a5f46',
          dark: '#2f3d2c',
        },
        accent: {
          gold: '#c9a961',
          crimson: '#a8424f',
        },
        card: {
          red: '#b83a3a',
          black: '#2b2822',
        },
      },
      fontFamily: {
        serif: ['Noto Serif JP', 'Source Serif Pro', 'serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1.5rem',
        lg: '3rem',
        xl: '6rem',
      },
    },
  },
  plugins: [],
}
