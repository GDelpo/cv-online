/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // INTENTIONAL: colors replace the default palette, so a color outside the tokens has no class to compile to.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      paper: 'var(--paper)',
      ink: 'var(--ink)',
      muted: 'var(--muted)',
      accent: 'var(--accent)',
    },
    fontFamily: {
      display: ['"Barlow Condensed"', '"Arial Narrow"', 'Arial', 'sans-serif'],
      sans: ['"IBM Plex Sans"', 'Arial', 'sans-serif'],
    },
  },
  plugins: [],
}
