import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0d0d0f', 900: '#0d0d0f', 800: '#141416', 700: '#1b1b1e', 600: '#232327', 500: '#2e2e33', 400: '#45454c' },
        ivory: { DEFAULT: '#f4efe6', 50: '#fbf9f5', 100: '#f4efe6', 200: '#e9e1d3', 300: '#d8cdb9' },
        gold: { DEFAULT: '#c9a96e', 300: '#e2cb9d', 400: '#d4b780', 500: '#c9a96e', 600: '#a8884f', 700: '#7f6638' },
        stone: { 400: '#a39c90', 500: '#857f74', 600: '#625d55' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Manrope Variable"', 'Manrope', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { luxe: '0.32em', wide2: '0.18em' },
      maxWidth: { shell: '1440px' },
      transitionTimingFunction: { luxe: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      keyframes: {
        floaty: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseRing: { '0%': { transform: 'scale(.6)', opacity: '0.9' }, '100%': { transform: 'scale(2.4)', opacity: '0' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scrollcue: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s ease-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        scrollcue: 'scrollcue 2s cubic-bezier(.6,0,.3,1) infinite',
      },
    },
  },
  plugins: [],
};
export default config;
