// Make the CV PDFs from the real print tree, or check the ones already made.
//   npm run pdf             builds with SKIP_PDF_CHECK=1, prints both locales, writes public/cv/ and its manifest.
//   npm run pdf -- --check  reads public/cv/ back with pdftotext. Needs Poppler on PATH.
// Local only: Chrome talks to the preview server on this machine and nothing else.

/* global document -- used inside the callbacks that run in the page */

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { preview } from 'vite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'cv')
const MANIFEST = join(OUT, 'manifest.json')
const LOCALES = ['es', 'en']
const PRINT_PATH = { es: '/', en: '/en' }
const MAX_PAGES = 2

const contentFile = (locale) => join(ROOT, 'src', 'content', `${locale}.json`)
const pdfFile = (locale) => join(OUT, `Guido-Delponte-CV-${locale}.pdf`)
const contentHash = (locale) => createHash('sha256').update(readFileSync(contentFile(locale))).digest('hex')
// INTENTIONAL: drops spaces and hyphens, because a line wrap adds a space or splits at a hyphen ("blood-\ndraw").
const flatten = (text) => text.replace(/[\s-]+/g, '')

function buildSite() {
  // INTENTIONAL: shell, because npm is npm.cmd on Windows and spawn cannot run a .cmd without one.
  const result = spawnSync('npm run build', {
    cwd: ROOT,
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, SKIP_PDF_CHECK: '1' },
  })
  if (result.status !== 0) throw new Error('pdf: the build failed, no PDF written')
}

async function printLocale(context, baseUrl, locale) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto(new URL(PRINT_PATH[locale], baseUrl).href, { waitUntil: 'load' })
  // App mounts the print tree right after hydration; a page that never hydrates fails here instead of printing wrong.
  await page.waitForSelector('.print-cv', { state: 'attached', timeout: 15000 })
  await page.evaluate(async () => {
    await Promise.all([
      document.fonts.load('400 16px "IBM Plex Sans"'),
      document.fonts.load('600 16px "IBM Plex Sans"'),
    ])
    await document.fonts.ready
  })
  const lang = await page.evaluate(() => document.documentElement.lang)
  if (lang !== locale) throw new Error(`pdf: ${locale} page has lang="${lang}"`)
  if (errors.length > 0) throw new Error(`pdf: ${locale} page threw: ${errors.join('; ')}`)
  await page.pdf({ path: pdfFile(locale), preferCSSPageSize: true, tagged: true, outline: true })
  await page.close()
}

async function generate() {
  buildSite()
  mkdirSync(OUT, { recursive: true })
  const server = await preview({ logLevel: 'warn', preview: { host: '127.0.0.1' } })
  const baseUrl = server.resolvedUrls?.local[0]
  if (!baseUrl) throw new Error('pdf: the preview server reported no URL')
  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    const context = await browser.newContext({ colorScheme: 'light' })
    // INTENTIONAL: the page is the local build; any request elsewhere is a bug and must not leave this machine.
    await context.route('**/*', (route) =>
      route.request().url().startsWith(baseUrl) ? route.continue() : route.abort(),
    )
    for (const locale of LOCALES) await printLocale(context, baseUrl, locale)
  } finally {
    await browser.close()
    await server.close()
  }
  // Last on purpose: if a print fails, the old manifest makes verify-dist reject the half-done result.
  const hashes = Object.fromEntries(LOCALES.map((locale) => [locale, contentHash(locale)]))
  writeFileSync(MANIFEST, `${JSON.stringify(hashes, null, 2)}\n`)
  console.log('pdf: public/cv/ written. Run npm run build to rebuild with the real manifest check.')
}

function pdfToText(file) {
  const result = spawnSync('pdftotext', ['-layout', '-enc', 'UTF-8', file, '-'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 })
  if (result.error || result.status !== 0) {
    throw new Error(`pdf: pdftotext could not read ${file}: ${result.error?.message ?? result.stderr}`)
  }
  return result.stdout
}

function checkLocale(locale, manifest, problems) {
  const name = `${locale} PDF`
  const content = JSON.parse(readFileSync(contentFile(locale), 'utf8'))
  if (!existsSync(pdfFile(locale))) {
    problems.push(`${name}: missing, run npm run pdf`)
    return
  }
  if (manifest[locale] !== contentHash(locale)) problems.push(`${name}: stale, run npm run pdf`)

  const raw = pdfToText(pdfFile(locale))
  const pages = raw.split('\f').length - 1
  const lines = raw.split(/\r?\n/).map((text) => text.trim())
  const flat = flatten(raw)
  if (pages === 0 || pages > MAX_PAGES) problems.push(`${name}: ${pages} pages, the limit is ${MAX_PAGES}`)

  const headings = [content.person.name, ...Object.values(content.ui.sections), ...content.positions.map((p) => p.title)]
  for (const heading of headings) {
    if (!lines.includes(heading)) problems.push(`${name}: heading "${heading}" is not on its own line`)
  }
  for (const position of content.positions) {
    const employer = position.company ?? position.engagement
    if (!flat.includes(flatten(employer))) problems.push(`${name}: employer "${employer}" not found`)
    for (const bullet of [...position.bullets, ...position.moreBullets]) {
      if (!flat.includes(flatten(`• ${bullet}`))) problems.push(`${name}: bullet not separate: "${bullet}"`)
    }
  }
  for (const item of content.education) {
    if (!flat.includes(flatten(item.degree))) problems.push(`${name}: education "${item.degree}" not found`)
  }
  for (const item of content.certifications) {
    if (!flat.includes(flatten(`• ${item.title}`))) problems.push(`${name}: certification "${item.title}" not found`)
  }
  // The catalog is plain text in Chrome's output; a future Chrome that compresses it fails here and gets looked at.
  if (!readFileSync(pdfFile(locale)).toString('latin1').includes(`/Lang (${locale})`)) {
    problems.push(`${name}: /Lang is not ${locale}`)
  }
}

function check() {
  if (!existsSync(MANIFEST)) throw new Error('pdf: public/cv/manifest.json is missing, run npm run pdf')
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'))
  const problems = []
  for (const locale of LOCALES) checkLocale(locale, manifest, problems)
  if (problems.length > 0) throw new Error(`pdf --check failed:\n- ${problems.join('\n- ')}`)
  console.log('pdf --check: ok')
}

try {
  if (process.argv.includes('--check')) check()
  else await generate()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
