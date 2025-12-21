/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warm: {
          DEFAULT: '#fdfaf9',
          50: '#fdfaf9', // Base background
          100: '#f7f3f2',
          200: '#eaddda',
          300: '#dbcbc8',
        },
        pastel: {
          purple: '#E0D4FC', // Soft purple
          blue: '#D4E5FC',   // Soft blue
          pink: '#FCD4E5',   // Soft pink
          yellow: '#FCFAD4', // Soft yellow
        }
      },
      fontFamily: {
        serif: ['"Shippori Mincho"', 'serif'],
        'sans-rounded': ['"Zen Maru Gothic"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 20px 60px -15px rgba(224, 212, 252, 0.4)', // Purple-ish shadow
        'soft-blue': '0 20px 60px -15px rgba(212, 229, 252, 0.4)',
      }
    },
  },
  plugins: [],
};
