/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind lit ces fichiers pour savoir quelles classes garder.
  content: ['./index.html', './src/**/*.{js,jsx}'],

  theme: {
    extend: {
      // Nos couleurs personnalisées. On les utilise ensuite comme
      // n'importe quelle couleur Tailwind : bg-brand-700, text-sable-500…
      colors: {
        brand: {
          50: '#effcf7',
          100: '#d7f6ea',
          200: '#b0ecd8',
          300: '#7bdcc0',
          500: '#1fa887',
          600: '#12876e',
          700: '#0f6c5a',
          800: '#105649',
          900: '#0f483e',
        },
        sable: {
          50: '#fdf8f0',
          100: '#faedd7',
          300: '#ebbe7b',
          500: '#d98428',
          700: '#9f4e1c',
        },
        ardoise: {
          50: '#f6f7f9',
          100: '#ecedf1',
          400: '#8a93a5',
          600: '#4c5566',
          800: '#232a37',
          900: '#151a24',
        },
      },
    },
  },

  plugins: [],
};
