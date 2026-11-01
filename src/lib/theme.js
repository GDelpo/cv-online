// Key shared with the inline script in index.html.
const KEY = 'theme'

export function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark')
  try {
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  } catch {
    // INTENTIONAL: private modes can refuse storage; the switch still holds for this page view.
  }
}
