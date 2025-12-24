/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        azulSalomao: '#0F2C4C',
        azulClaro: '#368FCA',
        cinzaFundo: '#F3F4F6',
      },
    },
  },
  plugins: [],
}
