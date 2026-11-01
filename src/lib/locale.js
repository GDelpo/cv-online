/** /en/index.html is the same file as /en, so it has to load the same locale or hydration replaces the page. */
export const localeFromPath = (pathname) => (/^\/en(\/index\.html)?\/*$/.test(pathname) ? 'en' : 'es')
