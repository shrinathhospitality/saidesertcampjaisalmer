/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10100e',
        obsidian: '#171512',
        ivory: '#f8f2e8',
        champagne: '#d8b26e',
        bronze: '#9b7042',
        sage: '#7b8b72',
        pearl: '#fffaf1'
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        luxury: '0 30px 80px rgba(16,16,14,.18)',
        glow: '0 0 60px rgba(216,178,110,.22)'
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, transparent, rgba(216,178,110,.8), transparent)'
      }
    }
  },
  plugins: []
};
