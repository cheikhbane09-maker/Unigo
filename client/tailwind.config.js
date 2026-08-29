/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette UNIGO : teal profond + accents sable/terracotta
        brand: {
          50: '#effcf7',
          100: '#d7f6ea',
          200: '#b0ecd8',
          300: '#7bdcc0',
          400: '#43c3a2',
          500: '#1fa887',
          600: '#12876e',
          700: '#0f6c5a',
          800: '#105649',
          900: '#0f483e',
        },
        sand: {
          50: '#fdf8f0',
          100: '#faedd7',
          200: '#f4d9ae',
          300: '#ebbe7b',
          400: '#e29d48',
          500: '#d98428',
          600: '#c0681e',
          700: '#9f4e1c',
          800: '#813f1d',
          900: '#6a351b',
        },
        ink: {
          50: '#f6f7f9',
          100: '#ecedf1',
          400: '#8a93a5',
          600: '#4c5566',
          800: '#232a37',
          900: '#151a24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,.04), 0 8px 24px -12px rgba(16,24,40,.18)',
        lift: '0 12px 40px -16px rgba(15,108,90,.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .5s ease-out both',
      },
    },
  },
  plugins: [],
};
