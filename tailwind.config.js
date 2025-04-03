/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7B2CBF',
          dark: '#5A189A',
          light: '#9D4EDD'
        },
        secondary: {
          DEFAULT: '#240046',
          dark: '#10002B',
        },
        background: {
          dark: '#121212',
          DEFAULT: '#1E1E1E',
          light: '#2D2D2D'
        },
        accent: {
          DEFAULT: '#C77DFF',
          dark: '#9D4EDD'
        }
      }
    },
  },
  plugins: [],
};