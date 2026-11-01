// Write the static pages from the Vite build and the SSR bundle: dist/index.html, dist/en/index.html, dist/sitemap.xml.
// Any render error or missing template placeholder stops the build: an empty #root must never ship.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const OG_LOCALE = { es: 'es_AR', en: 'en_US' }

const readContent = (locale) => JSON.parse(readFileSync(join(ROOT, 'src', 'content', `${locale}.json`), 'utf8'))
const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function replaceOnce(html, marker, value) {
  if (!html.includes(marker)) throw new Error(`prerender: template has no ${marker}`)
  // INTENTIONAL: a replacer function, because a "$" in the content would act as a pattern in a plain string.
  return html.replace(marker, () => value)
}

function findAsset(assets, pattern) {
  const found = assets.find((name) => pattern.test(name))
  if (!found) throw new Error(`prerender: no asset matches ${pattern}`)
  return `/assets/${found}`
}

const absolute = (content, path) => `${content.meta.siteUrl}${path}`

function jsonLd(content) {
  const { person, positions, education, certifications, languages } = content
  const employer = positions.find((position) => position.current && position.company)
  const credentials = certifications.filter((item) => item.credentialUrl)
  // INTENTIONAL: an ongoing degree is not "alumni of" yet; ISTEA stays out of this field and on the page.
  const finished = education.filter((item) => !item.inProgress)
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    dateModified: content.meta.dataDate,
    mainEntity: {
      '@type': 'Person',
      name: person.name,
      jobTitle: employer.title,
      worksFor: { '@type': 'Organization', name: employer.company },
      alumniOf: finished.map((item) => ({ '@type': 'EducationalOrganization', name: item.school })),
      knowsLanguage: languages.map((item) => item.name),
      image: absolute(content, person.photo.jpg),
      sameAs: [person.github, person.linkedin],
      ...(credentials.length > 0 && {
        hasCredential: credentials.map((item) => ({
          '@type': 'EducationalOccupationalCredential',
          name: item.title,
          url: item.credentialUrl,
        })),
      }),
    },
  }
  // "<" escaped so no value can close the script element.
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

function head(content, assets) {
  const { meta, person } = content
  const home = `${meta.siteUrl}/`
  const en = `${meta.siteUrl}/en`
  const self = meta.locale === 'en' ? en : home
  const other = meta.locale === 'en' ? 'es' : 'en'
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${self}" />`,
    `<link rel="alternate" hreflang="es" href="${home}" />`,
    `<link rel="alternate" hreflang="en" href="${en}" />`,
    `<link rel="alternate" hreflang="x-default" href="${home}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${self}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[meta.locale]}" />`,
    `<meta property="og:locale:alternate" content="${OG_LOCALE[other]}" />`,
    `<meta property="og:image" content="${meta.siteUrl}/og.jpg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(person.name)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="preload" as="image" type="image/webp" href="${person.photo.webp}" fetchpriority="high" />`,
    `<link rel="preload" as="font" type="font/woff2" crossorigin href="${findAsset(assets, /^newsreader-latin-500-normal.*\.woff2$/)}" />`,
    `<link rel="preload" as="font" type="font/woff2" crossorigin href="${findAsset(assets, /^ibm-plex-sans-latin-400-normal.*\.woff2$/)}" />`,
    // INTENTIONAL: the locale chunk comes from a dynamic import; preloading it keeps hydration from waiting a round trip.
    `<link rel="modulepreload" href="${findAsset(assets, new RegExp(`^${meta.locale}-[^.]*\\.js$`))}" />`,
    `<script type="application/ld+json">${jsonLd(content)}</script>`,
  ]
  return tags.join('\n    ')
}

function sitemap(content) {
  const { siteUrl, dataDate } = content.meta
  const alternates = [
    `<xhtml:link rel="alternate" hreflang="es" href="${siteUrl}/" />`,
    `<xhtml:link rel="alternate" hreflang="en" href="${siteUrl}/en" />`,
    `<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}/" />`,
  ].join('')
  const url = (loc) => `  <url><loc>${loc}</loc><lastmod>${dataDate}</lastmod>${alternates}</url>`
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${url(`${siteUrl}/`)}
${url(`${siteUrl}/en`)}
</urlset>
`
}

async function main() {
  const { render } = await import(pathToFileURL(join(ROOT, 'dist-ssr', 'entry-server.js')).href)
  const template = readFileSync(join(DIST, 'index.html'), 'utf8')
  const assets = readdirSync(join(DIST, 'assets'))
  const es = readContent('es')
  const en = readContent('en')

  for (const [content, outDir] of [
    [es, DIST],
    [en, join(DIST, 'en')],
  ]) {
    let html = replaceOnce(template, '<html lang="es">', `<html lang="${content.meta.locale}">`)
    html = replaceOnce(html, '<!--head-->', head(content, assets))
    html = replaceOnce(html, '<!--app-->', render(content))
    mkdirSync(outDir, { recursive: true })
    writeFileSync(join(outDir, 'index.html'), html)
  }
  writeFileSync(join(DIST, 'sitemap.xml'), sitemap(es))
  console.log('prerender: dist/index.html, dist/en/index.html, dist/sitemap.xml written')
}

await main()
