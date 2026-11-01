/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    // INTENTIONAL: colors replace the default palette, so a color outside the tokens has no class to compile to.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: 'var(--bg)',
      text: 'var(--text)',
      muted: 'var(--muted)',
      accent: 'var(--accent)',
      rule: 'var(--rule)',
    },
    fontFamily: {
      display: ['Newsreader', 'Georgia', 'serif'],
      sans: ['"IBM Plex Sans"', 'Arial', 'sans-serif'],
    },
    extend: {
      maxWidth: { page: '1120px', prose: '68ch' },
    },
  },
  plugins: [],
}
