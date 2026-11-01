import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import en from '../src/content/en.json'
import es from '../src/content/es.json'

const count = (html, pattern) => (html.match(pattern) ?? []).length
const copy = (content) => structuredClone(content)
const render = (content) => renderToString(<App content={content} />)

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

  it('fails loudly on a position that ended with no date', () => {
    const data = copy(content)
    data.positions[0].current = false
    data.positions[0].end = null
    expect(() => render(data)).toThrow()
  })
})

describe('locale separation', () => {
  it('shows no Spanish section label on the English page', () => {
    const html = render(en)
    for (const label of Object.values(es.ui.sections)) expect(html).not.toContain(`>${label}<`)
  })
})
