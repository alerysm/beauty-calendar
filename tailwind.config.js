/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skin: {
          100: '#fdf0f1',
          200: '#f9d9dc',
          300: '#edbfc3',
          400: '#e8b4b8',
          500: '#d4959a',
          600: '#b8717a',
          700: '#8f4d58',
          800: '#5e3040',
          900: '#3a1a28',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        'fade-in':  'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
