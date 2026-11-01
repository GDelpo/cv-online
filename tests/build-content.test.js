import { describe, expect, it } from 'vitest'
import { buildContent, GuardError, loadInputs } from '../scripts/build-content.mjs'

const ABOUT_SENTENCE = 'Hago APIs.'

function fixtures() {
  const ui = (present) => ({
    meta: { title: 'T', description: 'D' },
    sections: { summary: 's', experience: 'e', education: 'e', certifications: 'c', skills: 's', languages: 'l' },
    present,
    months: Array(12).fill('m'),
    viewCredential: 'v',
    credentialId: 'c',
    inProgress: 'i',
    downloadPdf: 'd',
    pdfPath: '/cv/x.pdf',
    showMore: 's',
    skipLink: 's',
    themeDark: 'd',
    themeLight: 'l',
    updated: 'u',
  })
  return {
    base: {
      dataDate: '2026-10',
      profile: { firstName: 'Ana', lastName: 'Prueba', headline: 'Dev | Otra cosa', about: [ABOUT_SENTENCE, 'Mas.'] },
      positions: [
        { id: 'vieja', title: 'Soporte', company: 'Vieja', location: null, start: '2015-04', end: '2020-11', current: false, bullets: ['Tarea vieja.'] },
        { id: 'freelance', title: 'Consultora', company: null, location: null, start: '2018-12', end: null, current: true, bullets: ['Tarea.', 'Relleno.'] },
      ],
      education: [{ id: 'abc', degree: 'Software', school: 'ABC - Largo', start: '2025', end: '2027', inProgress: true }],
      certifications: [
        { id: 'uno', title: 'Curso Uno', issuer: 'P', date: null, credentialId: null, credentialUrl: null },
        { id: 'dos', title: 'Curso Dos', issuer: 'I', date: '2024', credentialId: '1', credentialUrl: 'https://example.com/2' },
      ],
      skills: ['Python', 'Word'],
      languages: [{ name: 'Inglés', proficiency: 'Full professional proficiency' }, { name: 'Latín', proficiency: null }],
    },
    profile: {
      site: { url: 'https://example.com' },
      contact: { email: 'a@example.com', github: 'https://example.com/g', linkedin: 'https://example.com/l', location: 'Ciudad' },
      photo: { webp: '/a.webp', jpg: '/a.jpg', alt: 'Ana' },
      headline: 'Dev',
      summary: [ABOUT_SENTENCE],
      engagements: { freelance: 'Independiente' },
      schoolLabels: { abc: 'ABC' },
      skillGroups: [{ id: 'backend', label: 'Backend', items: ['Python'] }],
      omit: ['Word'],
      featuredCertifications: ['dos'],
      bulletTiers: {
        vieja: { bullets: [], moreBullets: ['Tarea vieja.'] },
        freelance: { bullets: ['Tarea.'], moreBullets: [] },
      },
      omitBullets: ['Relleno.'],
      languageLevels: { 'Full professional proficiency': 'Competencia completa' },
      extraLanguages: [{ name: 'Español', level: 'Nativo' }],
    },
    translations: {
      status: 'draft-review-by-guido',
      entries: [
        ['Dev', 'Dev'], [ABOUT_SENTENCE, 'I make APIs.'], ['Soporte', 'Support'], ['Tarea vieja.', 'Old task.'],
        ['Consultora', 'Consultant'], ['Independiente', 'Self-employed'], ['Tarea.', 'Task.'], ['Software', 'Software'],
        ['Curso Uno', 'Course One'], ['Curso Dos', 'Course Two'], ['Backend', 'Backend'], ['Python', 'Python'],
        ['Inglés', 'English'], ['Latín', 'Latin'], ['Español', 'Spanish'], ['Nativo', 'Native'],
      ].map(([source, en]) => ({ source, en })),
    },
    uiEs: ui('Actualidad'),
    uiEn: ui('Present'),
  }
}

function expectGuard(mutate, message) {
  const inputs = fixtures()
  mutate(inputs)
  let caught
  try {
    buildContent(inputs)
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(GuardError)
  expect(caught.message).toMatch(message)
}

describe('buildContent output', () => {
  const { es, en } = buildContent(fixtures())

  it('keeps nulls explicit for company, date, URL and level', () => {
    const freelance = en.positions.find((position) => position.id === 'freelance')
    expect(freelance.company).toBeNull()
    expect(freelance.engagement).toBe('Self-employed')
    expect(en.certifications.find((item) => item.id === 'uno')).toMatchObject({ date: null, credentialUrl: null, credentialId: null })
    expect(en.languages.find((item) => item.name === 'Latin').level).toBeNull()
  })

  it('sorts positions by start, newest first', () => {
    expect(es.positions.map((position) => position.id)).toEqual(['freelance', 'vieja'])
  })

  it('puts featured certifications first and marks them', () => {
    expect(es.certifications.map((item) => [item.id, item.featured])).toEqual([['dos', true], ['uno', false]])
  })

  it('tiers bullets, drops omitted ones and translates', () => {
    const freelance = en.positions.find((position) => position.id === 'freelance')
    expect(freelance.bullets).toEqual(['Task.'])
    expect(JSON.stringify(en)).not.toContain('Relleno')
    expect(JSON.stringify(es)).not.toContain('Relleno')
    expect(en.positions.find((position) => position.id === 'vieja').moreBullets).toEqual(['Old task.'])
  })

  it('uses the export level in English and the overlay level in Spanish', () => {
    expect(en.languages).toContainEqual({ name: 'English', level: 'Full professional proficiency' })
    expect(es.languages).toContainEqual({ name: 'Inglés', level: 'Competencia completa' })
    expect(en.languages[0]).toEqual({ name: 'Spanish', level: 'Native' })
  })

  it('sets the locale path and leaves meta out of ui', () => {
    expect(es.meta.path).toBe('/')
    expect(en.meta.path).toBe('/en')
    expect(en.ui.present).toBe('Present')
    expect(en.ui.meta).toBeUndefined()
  })
})

describe('guard failures', () => {
  it.each([
    ['base field', (i) => { delete i.base.profile.headline }, /base\.profile: missing required field "headline"/],
    ['base section', (i) => { delete i.base.positions }, /base\.positions: missing or empty/],
    ['position field', (i) => { i.base.positions[0].title = ' ' }, /position "vieja": missing required field "title"/],
    ['certification field', (i) => { delete i.base.certifications[0].issuer }, /certification "uno": missing required field "issuer"/],
    ['contact field', (i) => { delete i.profile.contact.email }, /profile\.contact: missing required field "email"/],
    ['data date', (i) => { i.base.dataDate = '2026' }, /base\.dataDate/],
  ])('missing required field: %s', (_name, mutate, message) => expectGuard(mutate, message))

  it('fails on a missing translation', () => {
    expectGuard((i) => { i.translations.entries = i.translations.entries.filter((e) => e.source !== 'Tarea.') }, /missing translation: "Tarea\."/)
  })

  it('fails on a stale translation when the source no longer matches', () => {
    expectGuard((i) => { i.translations.entries.find((e) => e.source === 'Tarea.').source = 'Tarea vieja y distinta.' }, /stale translation: "Tarea vieja y distinta\."/)
  })

  it('fails when the base changes under a translation', () => {
    expectGuard((i) => {
      i.base.positions[1].title = 'Otro titulo'
    }, /missing translation: "Otro titulo"[\s\S]*stale translation: "Consultora"/)
  })

  it('fails on an empty translation', () => {
    expectGuard((i) => { i.translations.entries[0].en = '' }, /entry needs "source" and "en"/)
  })

  it('fails on a duplicate translation source', () => {
    expectGuard((i) => { i.translations.entries.push({ source: 'Tarea.', en: 'Again.' }) }, /duplicate source "Tarea\."/)
  })

  it('fails without a translation status', () => {
    expectGuard((i) => { delete i.translations.status }, /en\.json: missing required field "status"/)
  })

  it('fails on a UI key mismatch in either direction', () => {
    expectGuard((i) => { delete i.uiEn.present }, /"present" is missing from ui\.en/)
    expectGuard((i) => { i.uiEn.sections.extra = 'x' }, /"sections\.extra" is missing from ui\.es/)
  })

  it('fails on a UI key both locales lack', () => {
    expectGuard((i) => { delete i.uiEn.skipLink; delete i.uiEs.skipLink }, /ui\.es: missing required key "skipLink"/)
  })

  it('fails without 12 months', () => {
    expectGuard((i) => { i.uiEs.months = ['ene'] }, /ui\.es\.months/)
  })

  it('fails on a skill neither grouped nor omitted', () => {
    expectGuard((i) => { i.base.skills.push('Rust') }, /skill "Rust" is neither grouped nor in omit/)
  })

  it('fails on a grouped skill the export does not have', () => {
    expectGuard((i) => { i.profile.skillGroups[0].items.push('Cobol') }, /skill "Cobol" is not in the export/)
  })

  it('fails on a bullet neither tiered nor omitted', () => {
    expectGuard((i) => { i.base.positions[0].bullets.push('Nueva.') }, /neither tiered nor in omitBullets: "Nueva\."/)
  })

  it('fails on a tiered bullet the export does not have', () => {
    expectGuard((i) => { i.profile.bulletTiers.vieja.bullets.push('Inventada.') }, /not in the export: "Inventada\."/)
  })

  it('fails on a stale omitBullets entry', () => {
    expectGuard((i) => { i.profile.omitBullets.push('Ya no existe.') }, /omitBullets entry is not in the export/)
  })

  it('fails on end: null without current: true', () => {
    expectGuard((i) => { i.base.positions[0].end = null }, /position "vieja": end is null without current: true/)
    expectGuard((i) => { i.base.positions[1].current = false }, /position "freelance": end is null without current: true/)
  })

  it('fails on any verified field, at any depth and in any input', () => {
    expectGuard((i) => { i.base.certifications[0].verified = true }, /base\.certifications\[0\]\.verified/)
    expectGuard((i) => { i.profile.verified = false }, /profile\.verified/)
  })

  it('fails on a bad date', () => {
    expectGuard((i) => { i.base.certifications[0].date = 'nov. 2024' }, /date must be YYYY-MM or YYYY/)
  })

  it('fails on a non-http credential URL', () => {
    expectGuard((i) => { i.base.certifications[0].credentialUrl = 'javascript:alert(1)' }, /not an http\(s\) URL/)
  })

  it('fails on a summary sentence absent from the export', () => {
    expectGuard((i) => { i.profile.summary = ['Hago APIs. Trabajé en la NASA.'] }, /summary sentence not in the export About: "Trabajé en la NASA\."/)
  })

  it('fails on a headline segment absent from the export', () => {
    expectGuard((i) => { i.profile.headline = 'Dev | CTO' }, /headline segment not in the export headline: "CTO"/)
  })

  it('fails on a summary over 600 characters in Spanish or English', () => {
    const long = 'x'.repeat(601)
    expectGuard((i) => {
      i.base.profile.about.push(`${long}.`)
      i.profile.summary = [`${long}.`]
      i.translations.entries = i.translations.entries.filter((e) => e.source !== ABOUT_SENTENCE)
      i.translations.entries.push({ source: `${long}.`, en: 'short' })
    }, /es summary: 602 characters/)
    expectGuard((i) => { i.translations.entries.find((e) => e.source === ABOUT_SENTENCE).en = long }, /en summary: 601 characters/)
  })

  it('fails on a position without company or engagement', () => {
    expectGuard((i) => { i.profile.engagements = {} }, /no company and no engagement label/)
  })

  it('fails on a featured certification that does not exist', () => {
    expectGuard((i) => { i.profile.featuredCertifications.push('fantasma') }, /featured certification "fantasma"/)
  })

  it('fails on an export language level without a Spanish label', () => {
    expectGuard((i) => { i.profile.languageLevels = {} }, /no entry in languageLevels/)
  })

  it('reports every problem at once', () => {
    const inputs = fixtures()
    inputs.base.skills.push('Rust')
    inputs.base.positions[0].end = null
    expect(() => buildContent(inputs)).toThrow(GuardError)
    try {
      buildContent(inputs)
    } catch (error) {
      expect(error.problems).toHaveLength(2)
    }
  })
})

describe('real data', () => {
  const { es, en } = buildContent(loadInputs())

  it('keeps every position, education, certification and skill in both locales', () => {
    for (const locale of [es, en]) {
      expect(locale.positions).toHaveLength(4)
      expect(locale.education).toHaveLength(2)
      expect(locale.certifications).toHaveLength(16)
      expect(locale.certifications.filter((item) => item.featured)).toHaveLength(5)
      expect(locale.skillGroups.flatMap((group) => group.items)).toHaveLength(41)
    }
  })

  it('orders positions and certifications as the spec says', () => {
    expect(es.positions.map((position) => position.id)).toEqual([
      'noble-seguros', 'freelance', 'maraton-de-buenos-aires', 'laboratorio-dr-enrique-iovine',
    ])
    expect(es.certifications[0].id).toBe('certificacion-profesional-en-inteligencia-artificial')
    expect(es.skillGroups[0].items[0]).toBe('Python')
  })

  it('has no postal code, stale LinkedIn URL, Ciena or "verified" anywhere', () => {
    const text = JSON.stringify([es, en])
    expect(text).not.toMatch(/C1429|in\/guido-delponte\/|Ciena|verified/i)
    expect(es.person.linkedin).toBe('https://www.linkedin.com/in/guido-delponte-7a26033a4/')
  })

  it('takes the English level from the export and adds only Spanish as native', () => {
    expect(en.languages).toEqual([
      { name: 'Spanish', level: 'Native' },
      { name: 'English', level: 'Full professional proficiency' },
    ])
  })
})
