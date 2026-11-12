/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vex: {
          base: '#0b0e0c',
          panel: '#121612',
          card: '#161c16',
          surface: '#1a201b',
          hover: '#222a23',
          border: 'rgba(255,255,255,0.07)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
