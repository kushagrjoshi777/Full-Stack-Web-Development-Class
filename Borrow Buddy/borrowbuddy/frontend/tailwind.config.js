/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Google Sans"', '"Product Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['Roboto', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#faf8f3',
        surface: '#ffffff',
        sand: { 50: '#f6f3ec', 100: '#efeadd', 200: '#e4ddcb' },
        forest: {
          50: '#eef6f0',
          100: '#d6eadb',
          200: '#aed4b7',
          300: '#7fb98d',
          400: '#4f9a64',
          500: '#2f7d48',
          600: '#1e6a38',
          700: '#17572e',
          800: '#134526',
          900: '#0f361e',
        },
        ink: { 900: '#1f2421', 700: '#3c4440', 500: '#5f6762', 400: '#80887f' },
        line: '#e5e1d6',
        amber: { soft: '#fdf1d6', deep: '#9a6a00' },
      },
      borderRadius: { xl2: '1.25rem' },
      boxShadow: {
        card: '0 1px 2px rgba(31,36,33,.06), 0 1px 3px rgba(31,36,33,.04)',
        lift: '0 4px 14px rgba(31,36,33,.10), 0 1px 3px rgba(31,36,33,.06)',
        pop: '0 12px 32px rgba(31,36,33,.16)',
      },
    },
  },
  plugins: [],
}
