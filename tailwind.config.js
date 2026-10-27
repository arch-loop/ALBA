/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Outfit', 'system-ui', 'sans-serif'] },
      colors: {
        cream: '#FAF7F2',
        sand: '#F3EEE7',
        line: '#E9E2D8',
        ink: '#2B2420',
        muted: '#8A7F75',
        sun: { DEFAULT: '#E8833A', soft: '#FBE7D7', dark: '#C96A25' },
        sea: { DEFAULT: '#3E9E8E', soft: '#DDF0EC' },
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.6)', opacity: 0 }, '70%': { transform: 'scale(1.1)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        rise: { '0%': { transform: 'translateY(8px)', opacity: 0 }, '100%': { transform: 'translateY(0)', opacity: 1 } },
        float: { '0%': { transform: 'translateY(0)', opacity: 1 }, '100%': { transform: 'translateY(-120px) rotate(20deg)', opacity: 0 } },
        pulseRing: { '0%': { boxShadow: '0 0 0 0 rgba(232,131,58,.5)' }, '100%': { boxShadow: '0 0 0 24px rgba(232,131,58,0)' } },
      },
      animation: {
        pop: 'pop .35s ease-out',
        rise: 'rise .4s ease-out both',
        float: 'float 1.6s ease-out forwards',
        pulseRing: 'pulseRing 1.4s ease-out infinite',
      },
    },
  },
  plugins: [],
};
