/** @type {import('tailwindcss').Config} */

module.exports = {
  safelist: [
    
  ],
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'sans-serif'],
        ubuntu: ['var(--font-ubuntu-mono)', 'sans-serif'],
        satisfy: ['var(--font-satisfy)', 'sans-serif'],
        fredericka: ['var(--font-fredericka)', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#00ff88',
          dark: '#00cc6a',
        },
        dark: '#0D1821',
        light: '#EFF1F3',
        greenish: '#4E6E5D',
        brown: '#AD8A64',
        redish: '#A44A3F',
      },
    },
  },
  plugins: [],
};
