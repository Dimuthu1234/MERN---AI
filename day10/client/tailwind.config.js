/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.25s ease-out',
        'blink-1': 'blink 1.2s infinite 0s',
        'blink-2': 'blink 1.2s infinite 0.2s',
        'blink-3': 'blink 1.2s infinite 0.4s',
      },
    },
  },
  plugins: [],
};
