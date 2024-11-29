/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
    theme: {
      extend: {
        animation: {
          'pulse': 'pulse 5s infinite',
          'slide-left': 'slide-left 3s ease-in-out infinite',
          'slide-right': 'slide-right 3s ease-in-out infinite',
          'fade-in': 'fade-in 2s ease-out',
          'spin-slow': 'spin 20s linear infinite',
        },
        keyframes: {
          pulse: {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' },
          },
          'slide-left': {
            '0%': { transform: 'translateY(-100%)' },
            '50%': { transform: 'translateY(0)' },
            '100%': { transform: 'translateY(100%)' },
          },
          'slide-right': {
            '0%': { transform: 'translateY(100%)' },
            '50%': { transform: 'translateY(0)' },
            '100%': { transform: 'translateY(-100%)' },
          },
          'fade-in': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
          'spin-slow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        },
      },
    },
    plugins: [],
  }

