/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        op: {
          parchment: '#f5e6c8',
          parchmentDark: '#deb887',
          parchmentCard: '#fff8ea',
          bountyGold: '#d4af37',
          bountyRed: '#8b0000',
          oceanBlue: '#0c1b29',
          oceanDark: '#060d15',
          navyBlue: '#1a365d',
          woodBrown: '#3e2723',
          woodDark: '#23140e',
          amberGold: '#f59e0b'
        }
      },
      fontFamily: {
        bounty: ['Cinzel', 'Georgia', 'serif'],
        pirate: ['Pirata One', 'Impact', 'cursive', 'sans-serif'],
        onepiece: ['Cinzel Decorative', 'Cinzel', 'serif']
      },
      boxShadow: {
        'wanted': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.5)',
        'crimson-glow': '0 0 20px rgba(220, 38, 38, 0.6)',
      },
      keyframes: {
        pulseFast: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        hammerStrike: {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(-45deg)' },
          '80%': { transform: 'rotate(10deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        gavelShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        }
      },
      animation: {
        'pulse-fast': 'pulseFast 0.8s ease-in-out infinite',
        'hammer': 'hammerStrike 0.4s ease-out',
        'shake': 'gavelShake 0.4s ease-in-out',
      }
    },
  },
  plugins: [],
}
