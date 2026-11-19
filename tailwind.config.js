/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        narmis: {
          bg: '#142523',          // Primary background - dark forest green
          surface: '#1D302C',     // Secondary background
          mountain: '#304943',    // Mountain green
          parchment: '#EAD3AA',   // Parchment beige
          cream: '#F5E9D2',       // Light cream
          gold: '#B88A4A',        // Antique gold
          brown: '#80674D',       // Muted brown
          charcoal: '#202724',     // Charcoal
          accent: '#C89354',      // Warm gold accent
          terracotta: '#D97A53',  // Terracotta for cartoon illustrations & alerts
          forestDark: '#0D1A18',  // Deep forest shadow
          forestLight: '#263D38', // Elevated card surface
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'parchment-gradient': 'linear-gradient(180deg, #F5E9D2 0%, #EAD3AA 100%)',
        'forest-gradient': 'linear-gradient(180deg, #142523 0%, #0D1A18 100%)',
      }
    },
  },
  plugins: [],
}
