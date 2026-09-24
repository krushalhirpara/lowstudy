/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs-320': '320px',
      'xs-360': '360px',
      'xs-375': '375px',
      'xs-390': '390px',
      'xs-412': '412px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1440px',
    },
    extend: {
      colors: {
        legal: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bccadc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0b1d3a',
        },
        saffron: {
          500: '#ff9933',
          600: '#e68019',
          700: '#cc6900',
        },
        gold: {
          400: '#f6ad55',
          500: '#dd6b20',
          600: '#c05621',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
