/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gray: {
          1000: '#0A0A0A',
          950: '#0a0e1a',
          900: '#0f1529',
          800: '#1D1D1D',
          700: '#272727',
          600: '#4b5563',
          500: '#6b7280',
          400: '#9B9B9B',
          300: '#d1d5db',
        },
        green: {
          success: '#10C8A8',
          hover: '#12D0AF',
        },
        red: {
          error: '#FF4E59',
          hover: '#FF5C67',
        },
      },
    },
  },
  plugins: [],
}
  