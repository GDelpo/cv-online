import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import PrintCV from '../src/components/PrintCV'
import en from '../src/content/en.json'
import es from '../src/content/es.json'
import { formatDate, formatEnd } from '../src/lib/format'
import { localeFromPath } from '../src/lib/locale'

const count = (html, pattern) => (html.match(pattern) ?? []).length
const copy = (content) => structuredClone(content)
const render = (content) => renderToString(<App content={content} />)
/** The words of a piece of markup, whatever lines it was broken into. */
const words = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

describe.each([
  ['es', es],
  ['en', en],
])('App in %s', (_locale, content) => {
  it('renders one h1 and every position, certification and education item', () => {
    const html = render(content)
    expect(count(html, /<h1[\s>]/g)).toBe(1)
    expect(count(html, /data-position="/g)).toBe(content.positions.length)
    expect(count(html, /data-certification="/g)).toBe(content.certifications.length)
    expect(count(html, /data-education="/g)).toBe(content.education.length)
  })

  it('never claims "verified"', () => {
    expect(render(content).toLowerCase()).not.toMatch(/verified|verificad/)
  })

  it('has no raw undefined or null text', () => {
    expect(render(content)).not.toMatch(/>(undefined|null)</)
  })

  it('survives a null company by showing the engagement', () => {
    const data = copy(content)
    data.positions[0].company = null
    data.positions[0].engagement = 'Engagement label'
    expect(render(data)).toContain('Engagement label')
  })

  it('leaves out a null certification date and shows no credential link without a URL', () => {
    const data = copy(content)
    const withoutLink = render({ ...data, certifications: data.certifications.map((item) => ({ ...item, date: null, credentialUrl: null })) })
    expect(withoutLink).not.toContain(content.ui.viewCredential)
    expect(count(withoutLink, /data-certification="/g)).toBe(content.certifications.length)
  })

  it('renders a language name alone when the level is null', () => {
    const data = copy(content)
    const { level } = data.languages[0]
    data.languages[0].level = null
    expect(render(data)).not.toContain(`>${level}<`)
    expect(render(data)).toContain(data.languages[0].name)
  })

  it.each([
    ['no start', { start: null, end: '2027' }, '2027'],
    ['no end', { start: '2025', end: null }, '2025'],
    ['no dates', { start: null, end: null }, null],
  ])('keeps an education item with %s, on screen and in print', (_name, dates, shown) => {
    const data = copy(content)
    Object.assign(data.education[0], dates)
    const screen = render(data)
    expect(count(screen, /data-education="/g)).toBe(content.education.length)
    expect(screen).toContain(data.education[0].degree)
    expect(screen).not.toMatch(/>(undefined|null)</)
    const print = renderToString(<PrintCV content={data} />)
    expect(print).toContain(data.education[0].degree)
    if (shown) expect(print).toContain(shown)
  })

  it('names the role on each show-more control', () => {
    const html = render(content)
    for (const position of content.positions.filter((item) => item.moreBullets.length > 0)) {
      const label = renderToString(<>{position.company ?? position.engagement}</>)
      expect(html).toContain(`<span class="sr-only">: ${label}</span>`)
    }
  })

  it('fails loudly on a position that ended with no date', () => {
    const data = copy(content)
    data.positions[0].current = false
    data.positions[0].end = null
    expect(() => render(data)).toThrow()
  })
})

describe('the map in the page', () => {
  describe.each([
    ['es', es],
    ['en', en],
  ])('%s', (_locale, content) => {
    const html = render(content)
    const svgs = html.match(/<svg class="tm tm-[\s\S]*?<\/svg>/g)

    it('prerenders one drawing per form, each a labelled group', () => {
      expect(svgs).toHaveLength(4)
      for (const svg of svgs) expect(svg).toContain(`role="group" aria-label="${content.ui.mapLabel}"`)
    })

    it('links every station to its entry and names the link with its visible name and period', () => {
      for (const svg of svgs) {
        for (const position of content.positions) {
          const link = svg.match(new RegExp(`<a [^>]*href="#position-${position.id}"[^>]*>[\\s\\S]*?</a>`))?.[0]
          expect(link, position.id).toBeTruthy()
          expect(link).not.toContain('aria-label')
          // Everything but the disc letter is the link's name, so none of it may be hidden from a screen reader.
          const [named, disc] = link.split('<g class="tm-disc"')
          expect(named).not.toContain('aria-hidden')
          expect(disc).toMatch(/^ aria-hidden="true"/)
          const period = `${formatDate(position.start, content.ui.months)} – ${formatEnd(position.end, position.current, content.ui)}`
          expect(words(named)).toBe(words(renderToString(<>{`${position.company ?? position.engagement} ${period}`}</>)))
        }
      }
      for (const position of content.positions) expect(html).toContain(`id="position-${position.id}"`)
    })

    it('hides the line art and the lone "now" word from a screen reader, and names the photo', () => {
      for (const svg of svgs) {
        expect(svg).toMatch(/<g aria-hidden="true"><path d="[^"]*" class="tm-axis"/)
        expect(svg).toMatch(new RegExp(`<text [^>]*aria-hidden="true"[^>]*><tspan class="tm-name">${content.ui.present}<`))
        expect(svg).toMatch(new RegExp(`<image [^>]*aria-label="${content.person.photo.alt}"`))
      }
    })

    it('writes its labels as real text', () => {
      for (const position of content.positions) {
        const name = renderToString(<>{position.company ?? position.engagement}</>)
        const words = name.split(' ')
        for (const svg of svgs) expect(svg).toContain(words[0])
      }
    })

    it('links every skill branch to a group that exists', () => {
      for (const group of content.skillGroups) {
        expect(svgs[0]).toContain(`href="#skill-${group.id}"`)
        expect(html).toContain(`id="skill-${group.id}"`)
      }
    })

    it('has only one clip path per form, so ids stay unique', () => {
      for (const name of ['wide', 'mid', 'tablet', 'phone']) expect(count(html, new RegExp(`<clipPath id="tm-face-${name}"`, 'g'))).toBe(1)
    })

    it('puts the summary right after the header', () => {
      const header = html.indexOf('</header>')
      expect(html.indexOf('id="summary"')).toBeGreaterThan(header)
      expect(html.indexOf('id="summary"')).toBeLessThan(html.indexOf('id="experience"'))
    })

    it('shows role, place, links and PDF inside the header', () => {
      const header = html.slice(0, html.indexOf('</header>'))
      for (const text of [content.person.location, content.person.github, content.person.linkedin, content.ui.pdfPath]) {
        expect(header).toContain(text)
      }
      expect(header).toContain('headline')
    })

    it('keeps the heading levels: h1 name, h2 sections, h3 entries', () => {
      expect(html).toMatch(new RegExp(`<h1[^>]*>.*${content.person.name.split(' ')[0]}`))
      for (const [id, label] of Object.entries(content.ui.sections)) {
        expect(html).toMatch(new RegExp(`<h2 id="${id}"[^>]*>(<span[^>]*></span>)?${label}</h2>`))
        expect(html).toContain(`aria-labelledby="${id}"`)
      }
      expect(count(html, /<h2[\s>]/g)).toBe(Object.keys(content.ui.sections).length)
      expect(count(html, /<h3[\s>]/g)).toBe(content.positions.length + content.projects.length)
    })

    it('has a skip link that lands on a focusable main', () => {
      expect(html).toContain(`<a href="#content" class="skip">${content.ui.skipLink}</a>`)
      expect(html).toMatch(/<main id="content" tabindex="-1">/)
    })

    it('points each locale link at its own page and marks the current one', () => {
      const link = (code) => html.match(new RegExp(`<a [^>]*hrefLang="${code}"[^>]*>`))[0]
      expect(link('es')).toContain('href="/"')
      expect(link('en')).toContain('href="/en"')
      const other = content.meta.locale === 'es' ? 'en' : 'es'
      expect(link(content.meta.locale)).toContain('aria-current="page"')
      expect(link(other)).not.toContain('aria-current')
    })

    it('renders the projects with their links', () => {
      expect(count(html, /data-project="/g)).toBe(content.projects.length)
      for (const item of content.projects) expect(html).toContain(`href="${item.url}"`)
    })
  })

  it('still renders with a fifth current role and no code change', () => {
    const data = copy(en)
    data.positions.unshift({ ...data.positions[0], id: 'next', company: 'New Employer', start: data.meta.dataDate })
    const html = render(data)
    expect(count(html, /data-position="/g)).toBe(data.positions.length)
    expect(count(html, /class="tm-st tm-st-/g)).toBe(data.positions.length * 4)
    expect(html).toContain('New Employer')
  })
})

describe('locale from the path', () => {
  it.each([
    ['/', 'es'],
    ['/en', 'en'],
    ['/en/', 'en'],
    ['/en/index.html', 'en'],
    ['/index.html', 'es'],
    ['/english', 'es'],
    ['/en/other', 'es'],
  ])('%s is %s', (path, locale) => {
    expect(localeFromPath(path)).toBe(locale)
  })
})

describe('locale separation', () => {
  it('shows no Spanish section label on the English page', () => {
    const html = render(en)
    for (const label of Object.values(es.ui.sections)) expect(html).not.toContain(`>${label}<`)
  })
})
