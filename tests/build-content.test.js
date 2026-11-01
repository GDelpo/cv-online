import { describe, expect, it } from 'vitest'
import { buildContent, GuardError, loadInputs } from '../scripts/build-content.mjs'

const ABOUT_SENTENCE = 'Hago APIs.'

function fixtures() {
  const ui = (present) => ({
    meta: { title: 'T', description: 'D' },
    sections: { summary: 's', experience: 'e', projects: 'p', education: 'e', certifications: 'c', skills: 's', languages: 'l' },
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
    viewRepository: 'r',
    mapLabel: 'm',
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
      projects: {
        comment: 'allowlist',
        items: [{ id: 'mi-repo', name: 'mi-repo', url: 'https://github.com/GDelpo/mi-repo', description: 'Hace cosas' }],
      },
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
        ['Inglés', 'English'], ['Latín', 'Latin'], ['Español', 'Spanish'], ['Nativo', 'Native'], ['Hace cosas', 'Does things'],
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

  it('fails when a position and an education item share an id, because the map keys both by id', () => {
    expectGuard((i) => { i.base.education[0].id = 'vieja' }, /education "vieja": id is also a position id/)
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

  it.each([
    ['position month', (i) => { i.base.positions[0].start = '2020-13' }, /position "vieja"\.start: date must be/],
    ['education month', (i) => { i.base.education[0].end = '2027-00' }, /education "abc"\.end: date must be/],
    ['data date month', (i) => { i.base.dataDate = '2026-13' }, /base\.dataDate/],
    ['position end before start', (i) => { i.base.positions[0].end = '2010-01' }, /position "vieja": end 2010-01 is before start 2015-04/],
    ['position year end before start', (i) => { i.base.positions[0].end = '2014' }, /position "vieja": end 2014 is before start/],
    ['education end before start', (i) => { i.base.education[0].end = '2024' }, /education "abc": end 2024 is before start 2025/],
    ['position start after the data date', (i) => { i.base.positions[1].start = '2027-01' }, /position "freelance"\.start: 2027-01 is after the data date/],
    ['position start far ahead', (i) => { i.base.positions[1].start = '9999' }, /position "freelance"\.start: 9999 is after the data date/],
    ['position end after the data date', (i) => { i.base.positions[0].end = '2026-11' }, /position "vieja"\.end: 2026-11 is after the data date/],
    ['education start after the data date', (i) => { i.base.education[0].start = '2027'; i.base.education[0].end = '2028' }, /education "abc"\.start: 2027 is after the data date/],
    ['certification after the data date', (i) => { i.base.certifications[0].date = '2027' }, /certification "uno"\.date: 2027 is after the data date/],
  ])('fails on an impossible date: %s', (_name, mutate, message) => expectGuard(mutate, message))

  it('accepts a degree expected to end after the data date and a year closing its own start', () => {
    const inputs = fixtures()
    inputs.base.positions[0].start = '2020-05'
    inputs.base.positions[0].end = '2020'
    expect(() => buildContent(inputs)).not.toThrow()
    expect(inputs.base.education[0].end > inputs.base.dataDate).toBe(true)
  })

  it('fails on a blank company even when an engagement label exists', () => {
    expectGuard((i) => {
      i.base.positions[0].company = ''
      i.profile.engagements.vieja = 'Independiente'
    }, /position "vieja": company must be text or null/)
  })

  it('fails on a language name that appears twice, in the base or through the overlay', () => {
    expectGuard((i) => { i.base.languages.push({ name: 'Latín', proficiency: null }) }, /language name: duplicate "Latín"/)
    expectGuard((i) => { i.profile.extraLanguages.push({ name: 'Inglés', level: null }) }, /language name: duplicate "Inglés"/)
  })

  it('fails on a non-http credential URL', () => {
    expectGuard((i) => { i.base.certifications[0].credentialUrl = 'javascript:alert(1)' }, /not an http\(s\) URL/)
  })

  it('fails on a bullet rewrite whose exported bullet is gone', () => {
    expectGuard((i) => { i.profile.bulletRewrites = { 'Ya no existe.': 'Texto.' } }, /bulletRewrites entry is not in the export/)
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

  it.each([
    ['another account', 'https://github.com/otra-persona/mi-repo'],
    ['plain http', 'http://github.com/GDelpo/mi-repo'],
    ['another host', 'https://gitlab.com/GDelpo/mi-repo'],
    ['a look-alike host', 'https://github.com.evil.example/GDelpo/mi-repo'],
    ['a deeper path', 'https://github.com/GDelpo/mi-repo/issues'],
    ['a script', 'javascript:alert(1)'],
  ])('fails on a project URL at %s', (_name, url) => {
    expectGuard((i) => { i.profile.projects.items[0].url = url }, /url must be https:\/\/github\.com\/GDelpo\/<repo>/)
  })

  it('fails on a project whose URL names a different repo', () => {
    expectGuard((i) => { i.profile.projects.items[0].url = 'https://github.com/GDelpo/otro' }, /points at "otro", not at its id/)
  })

  it('fails on a missing, incomplete or repeated project', () => {
    expectGuard((i) => { delete i.profile.projects }, /profile\.projects\.items: missing/)
    expectGuard((i) => { delete i.profile.projects.items[0].description }, /project "mi-repo": missing required field "description"/)
    expectGuard((i) => { i.profile.projects.items.push(i.profile.projects.items[0]) }, /project id: duplicate "mi-repo"/)
  })

  it('fails on a project description with no translation', () => {
    expectGuard((i) => { i.profile.projects.items[0].description = 'Otra cosa' }, /missing translation: "Otra cosa"/)
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

  // INTENTIONAL: compared with the export, not with a fixed count, so a new job is a data change and needs no code.
  it('keeps every position, education, certification and skill in both locales', () => {
    const { base, profile } = loadInputs()
    for (const locale of [es, en]) {
      expect(locale.positions).toHaveLength(base.positions.length)
      expect(locale.education).toHaveLength(base.education.length)
      expect(locale.certifications).toHaveLength(base.certifications.length)
      expect(locale.certifications.filter((item) => item.featured)).toHaveLength(profile.featuredCertifications.length)
      expect(locale.skillGroups.flatMap((group) => group.items)).toHaveLength(base.skills.length)
    }
  })

  it('lists no projects until a repo is added to the allowlist', () => {
    expect(es.projects).toEqual([])
    expect(en.projects).toEqual([])
  })

  it('orders positions and certifications as the spec says', () => {
    const starts = es.positions.map((position) => position.start)
    expect(starts).toEqual([...starts].sort((a, b) => b.localeCompare(a)))
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
