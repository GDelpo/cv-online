import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from '../src/App'
import PrintCV from '../src/components/PrintCV'
import en from '../src/content/en.json'
import es from '../src/content/es.json'

const count = (html, pattern) => (html.match(pattern) ?? []).length
const plain = (text) => renderToString(<>{text}</>)
const render = (content) => renderToString(<PrintCV content={content} />)

describe.each([
  ['es', es],
  ['en', en],
])('PrintCV in %s', (_locale, content) => {
  it('has one h1, a h2 per section and a h3 per printed position', () => {
    const html = render(content)
    expect(count(html, /<h1[\s>]/g)).toBe(1)
    const hidden = content.projects.some((item) => item.print) ? 0 : 1
    expect(count(html, /<h2[\s>]/g)).toBe(Object.keys(content.ui.sections).length - hidden)
    expect(count(html, /<h3[\s>]/g)).toBe(content.positions.filter((position) => position.print).length)
  })

  it('prints only the chosen summary and bullets of each position, and leaves omitted positions out', () => {
    const html = render(content)
    for (const position of content.positions) {
      if (!position.print) {
        expect(html).not.toContain(plain(position.title))
        continue
      }
      if (position.print.summary) expect(html).toContain(plain(position.print.summary))
      for (const bullet of position.print.bullets) expect(html).toContain(plain(bullet))
      const unprinted = [...position.bullets, ...position.moreBullets].filter((bullet) => !position.print.bullets.includes(bullet))
      for (const bullet of unprinted) expect(html).not.toContain(plain(bullet))
    }
  })

  it('keeps every education item and marks the one in progress', () => {
    const html = render(content)
    for (const item of content.education) expect(html).toContain(plain(item.degree))
    expect(html).toContain(content.ui.inProgress)
  })

  it('lists only the printed certifications, with their URL only when present', () => {
    const html = render(content)
    for (const item of content.certifications) {
      if (!item.print) {
        expect(html).not.toContain(plain(item.title))
        continue
      }
      expect(html).toContain(plain(item.title))
      if (item.credentialUrl) expect(html).toContain(plain(item.credentialUrl))
    }
    const bare = render({
      ...content,
      certifications: content.certifications.map((item) => ({ ...item, date: null, credentialId: null, credentialUrl: null })),
    })
    expect(bare).not.toContain(content.ui.credentialId)
    expect(bare).not.toContain('https://www.educacionit.com')
  })

  it('survives a null company, location and language level', () => {
    const data = structuredClone(content)
    data.positions[0].company = null
    data.positions[0].engagement = 'Engagement label'
    data.positions[0].location = null
    data.languages[0].level = null
    const html = render(data)
    expect(html).toContain('Engagement label')
    expect(html).toContain(data.languages[0].name)
    expect(html).not.toMatch(/>(undefined|null)</)
  })

  it('lists the projects with their full URLs', () => {
    const item = { id: 'mi-repo', name: 'mi-repo', url: 'https://github.com/GDelpo/mi-repo', description: 'Descripción', print: true }
    const html = render({ ...content, projects: [item] })
    expect(html).toContain(`<h2>${content.ui.sections.projects}</h2>`)
    expect(html).toContain(plain(item.description))
    expect(html).toContain(item.url)
  })

  it('leaves out the projects heading when the list is empty', () => {
    const html = render({ ...content, projects: [] })
    expect(html).not.toContain(`<h2>${content.ui.sections.projects}</h2>`)
  })

  it('prints only the projects chosen for print', () => {
    const html = render(content)
    for (const item of content.projects) {
      if (item.print) expect(html).toContain(item.url)
      else expect(html).not.toContain(item.url)
    }
  })

  it('never claims "verified" and shows the full contact URLs as text', () => {
    const html = render(content)
    expect(html.toLowerCase()).not.toMatch(/verified|verificad/)
    expect(html).toContain(content.person.github)
    expect(html).toContain(content.person.linkedin)
  })

  it('stays out of the prerendered page, which keeps its single h1', () => {
    const html = renderToString(<App content={content} />)
    expect(html).not.toContain('print-cv')
    expect(count(html, /<h1[\s>]/g)).toBe(1)
  })
})
