// Merge data/base.json with the overlays, run the guard and write src/content/{es,en}.json.
// A failed guard stops dev, test and build: missing data never reaches the page as a blank.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SUMMARY_MAX = 600
const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/
const DATA_DATE = /^\d{4}-(0[1-9]|1[0-2])$/
const URL_PATTERN = /^https?:\/\/\S+$/
// INTENTIONAL: only Guido's own repos may be linked, and each link names its repo, nothing deeper.
const PROJECT_URL = /^https:\/\/github\.com\/GDelpo\/([A-Za-z0-9._-]+)$/
const UI_REQUIRED = [
  'meta.title', 'meta.description',
  'sections.summary', 'sections.experience', 'sections.projects', 'sections.education',
  'sections.certifications', 'sections.skills', 'sections.languages',
  'present', 'months', 'viewCredential', 'credentialId', 'inProgress', 'downloadPdf',
  'pdfPath', 'showMore', 'skipLink', 'themeDark', 'themeLight', 'updated', 'viewRepository', 'mapLabel',
]

export class GuardError extends Error {
  constructor(problems) {
    super(`content guard failed:\n- ${problems.join('\n- ')}`)
    this.name = 'GuardError'
    this.problems = problems
  }
}

const isText = (value) => typeof value === 'string' && value.trim() !== ''
const list = (value) => (Array.isArray(value) ? value : [])

function requireFields(object, fields, where, problems) {
  for (const field of fields) {
    if (!isText(object?.[field])) problems.push(`${where}: missing required field "${field}"`)
  }
}

function requireList(value, where, problems) {
  if (!Array.isArray(value) || value.length === 0) problems.push(`${where}: missing or empty`)
}

function findVerified(value, path, problems) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => findVerified(item, `${path}[${index}]`, problems))
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (key.toLowerCase() === 'verified') problems.push(`${path}.${key}: "verified" fields are forbidden`)
      findVerified(child, `${path}.${key}`, problems)
    }
  }
}

function checkDate(value, where, problems) {
  if (value !== null && value !== undefined && !DATE.test(value)) {
    problems.push(`${where}: date must be YYYY-MM or YYYY, found "${value}"`)
  }
}

// YYYY-MM compares correctly as text. A bare year spans its whole year, so "2020" can end a "2020-05" start.
const earliest = (date) => (date.length > 4 ? date : `${date}-01`)
const latest = (date) => (date.length > 4 ? date : `${date}-12`)
const isDate = (value) => typeof value === 'string' && DATE.test(value)

function checkNotFuture(value, dataDate, where, problems) {
  if (isDate(value) && DATA_DATE.test(dataDate ?? '') && earliest(value) > dataDate) {
    problems.push(`${where}: ${value} is after the data date ${dataDate}`)
  }
}

function checkOrder(start, end, where, problems) {
  if (isDate(start) && isDate(end) && latest(end) < earliest(start)) {
    problems.push(`${where}: end ${end} is before start ${start}`)
  }
}

function checkUrl(value, where, problems) {
  // INTENTIONAL: these end up in href attributes, so anything but http(s) must never pass.
  if (isText(value) && !URL_PATTERN.test(value)) problems.push(`${where}: not an http(s) URL: "${value}"`)
}

function checkUnique(values, where, problems) {
  const seen = new Set()
  for (const value of values) {
    if (seen.has(value)) problems.push(`${where}: duplicate "${value}"`)
    seen.add(value)
  }
}

function guardBase(base, problems) {
  if (!DATA_DATE.test(base?.dataDate ?? '')) problems.push('base.dataDate: must be YYYY-MM')
  requireFields(base?.profile, ['firstName', 'lastName', 'headline'], 'base.profile', problems)
  requireList(base?.profile?.about, 'base.profile.about', problems)
  for (const section of ['positions', 'education', 'certifications', 'skills', 'languages']) {
    requireList(base?.[section], `base.${section}`, problems)
  }

  for (const position of list(base?.positions)) {
    const where = `position "${position?.id}"`
    requireFields(position, ['id', 'title', 'start'], where, problems)
    if (!Array.isArray(position?.bullets)) problems.push(`${where}: missing required field "bullets"`)
    checkDate(position?.start, `${where}.start`, problems)
    checkDate(position?.end, `${where}.end`, problems)
    if (position?.end == null && position?.current !== true) {
      problems.push(`${where}: end is null without current: true`)
    }
    if (position?.end != null && position?.current === true) {
      problems.push(`${where}: has an end date and current: true`)
    }
    // INTENTIONAL: blank is not null. `company ?? engagement` would keep the "" and print a blank employer.
    if (position?.company != null && !isText(position.company)) {
      problems.push(`${where}: company must be text or null, found ${JSON.stringify(position.company)}`)
    }
    checkOrder(position?.start, position?.end, where, problems)
    checkNotFuture(position?.start, base?.dataDate, `${where}.start`, problems)
    checkNotFuture(position?.end, base?.dataDate, `${where}.end`, problems)
  }
  for (const item of list(base?.education)) {
    const where = `education "${item?.id}"`
    requireFields(item, ['id', 'degree', 'school'], where, problems)
    checkDate(item?.start, `${where}.start`, problems)
    checkDate(item?.end, `${where}.end`, problems)
    checkOrder(item?.start, item?.end, where, problems)
    // Only the start: a degree in progress has an expected end after the data date.
    checkNotFuture(item?.start, base?.dataDate, `${where}.start`, problems)
  }
  for (const item of list(base?.certifications)) {
    const where = `certification "${item?.id}"`
    requireFields(item, ['id', 'title', 'issuer'], where, problems)
    checkDate(item?.date, `${where}.date`, problems)
    checkNotFuture(item?.date, base?.dataDate, `${where}.date`, problems)
    checkUrl(item?.credentialUrl, `${where}.credentialUrl`, problems)
  }
  for (const item of list(base?.languages)) {
    requireFields(item, ['name'], 'base.languages item', problems)
  }
  for (const section of ['positions', 'education', 'certifications']) {
    checkUnique(list(base?.[section]).map((item) => item?.id), `base.${section} id`, problems)
  }
  // INTENTIONAL: the map places roles and studies in one column and finds each by id, so these two share a namespace.
  const positionIds = new Set(list(base?.positions).map((item) => item?.id))
  for (const item of list(base?.education)) {
    if (item?.id != null && positionIds.has(item.id)) problems.push(`education "${item.id}": id is also a position id`)
  }
}

function guardProfile(base, profile, problems) {
  requireFields(profile?.site, ['url'], 'profile.site', problems)
  requireFields(profile?.contact, ['email', 'github', 'linkedin', 'location'], 'profile.contact', problems)
  requireFields(profile?.photo, ['webp', 'jpg', 'alt'], 'profile.photo', problems)
  requireFields(profile, ['headline'], 'profile', problems)
  requireList(profile?.summary, 'profile.summary', problems)
  for (const field of ['github', 'linkedin']) checkUrl(profile?.contact?.[field], `profile.contact.${field}`, problems)
  checkUrl(profile?.site?.url, 'profile.site.url', problems)

  const skills = new Set(list(base?.skills))
  const grouped = list(profile?.skillGroups).flatMap((group) => list(group?.items))
  const omitted = list(profile?.omit)
  const skillRefs = [...grouped, ...omitted]
  for (const group of list(profile?.skillGroups)) requireFields(group, ['id', 'label'], 'skill group', problems)
  checkUnique(skillRefs, 'skill', problems)
  for (const skill of skills) {
    if (!skillRefs.includes(skill)) problems.push(`skill "${skill}" is neither grouped nor in omit`)
  }
  for (const skill of skillRefs) {
    if (!skills.has(skill)) problems.push(`skill "${skill}" is not in the export`)
  }

  const tiers = profile?.bulletTiers ?? {}
  const omittedBullets = list(profile?.omitBullets)
  const positionIds = new Set(list(base?.positions).map((position) => position?.id))
  for (const id of Object.keys(tiers)) {
    if (!positionIds.has(id)) problems.push(`bulletTiers.${id}: no such position`)
  }
  const exported = new Set()
  for (const position of list(base?.positions)) {
    const tier = tiers[position?.id]
    const tiered = [...list(tier?.bullets), ...list(tier?.moreBullets)]
    checkUnique(tiered, `position "${position?.id}" bullet`, problems)
    for (const bullet of list(position?.bullets)) {
      exported.add(bullet)
      if (!tiered.includes(bullet) && !omittedBullets.includes(bullet)) {
        problems.push(`bullet of "${position?.id}" is neither tiered nor in omitBullets: "${bullet}"`)
      }
    }
    for (const bullet of tiered) {
      if (!list(position?.bullets).includes(bullet)) {
        problems.push(`tiered bullet of "${position?.id}" is not in the export: "${bullet}"`)
      }
      if (omittedBullets.includes(bullet)) problems.push(`bullet both tiered and omitted: "${bullet}"`)
    }
  }
  for (const bullet of omittedBullets) {
    if (!exported.has(bullet)) problems.push(`omitBullets entry is not in the export: "${bullet}"`)
  }

  for (const position of list(base?.positions)) {
    if (!position?.company && !isText(profile?.engagements?.[position?.id])) {
      problems.push(`position "${position?.id}" has no company and no engagement label`)
    }
  }

  // INTENTIONAL: a rewrite is keyed by the exported bullet, so a changed export shows up here instead of going stale.
  for (const [source, text] of Object.entries(profile?.bulletRewrites ?? {})) {
    if (!exported.has(source)) problems.push(`bulletRewrites entry is not in the export: "${source}"`)
    if (!isText(text)) problems.push(`bulletRewrites entry has no text: "${source}"`)
  }

  const certIds = new Set(list(base?.certifications).map((item) => item?.id))
  checkUnique(list(profile?.featuredCertifications), 'featured certification', problems)
  for (const id of list(profile?.featuredCertifications)) {
    if (!certIds.has(id)) problems.push(`featured certification "${id}" is not in the export`)
  }

  for (const item of list(base?.languages)) {
    if (item?.proficiency && !isText(profile?.languageLevels?.[item.proficiency])) {
      problems.push(`language level "${item.proficiency}" has no entry in languageLevels`)
    }
  }
  for (const item of list(profile?.extraLanguages)) requireFields(item, ['name'], 'profile.extraLanguages item', problems)
  checkUnique([...list(profile?.extraLanguages), ...list(base?.languages)].map((item) => item?.name), 'language name', problems)
}

// INTENTIONAL: an allowlist, not a GitHub import. A repo reaches the page only by being written here on purpose.
// An empty list is valid and hides the section; a missing one is still a mistake.
function guardProjects(profile, problems) {
  const items = profile?.projects?.items
  if (!Array.isArray(items)) problems.push('profile.projects.items: missing')
  for (const item of list(items)) {
    const where = `project "${item?.id}"`
    requireFields(item, ['id', 'name', 'url', 'description'], where, problems)
    const repo = PROJECT_URL.exec(item?.url ?? '')
    if (!repo) problems.push(`${where}: url must be https://github.com/GDelpo/<repo>, found "${item?.url}"`)
    else if (repo[1] !== item.id) problems.push(`${where}: url points at "${repo[1]}", not at its id`)
  }
  checkUnique(list(items).map((item) => item?.id), 'project id', problems)
}

function keyPaths(value, prefix = '') {
  if (Array.isArray(value) || value === null || typeof value !== 'object') return [prefix]
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
}

function guardUi(uiEs, uiEn, problems) {
  const es = new Set(keyPaths(uiEs ?? {}))
  const en = new Set(keyPaths(uiEn ?? {}))
  for (const key of es) if (!en.has(key)) problems.push(`UI key mismatch: "${key}" is missing from ui.en`)
  for (const key of en) if (!es.has(key)) problems.push(`UI key mismatch: "${key}" is missing from ui.es`)
  for (const [locale, ui, keys] of [['es', uiEs, es], ['en', uiEn, en]]) {
    for (const key of UI_REQUIRED) {
      if (!keys.has(key)) problems.push(`ui.${locale}: missing required key "${key}"`)
    }
    if (list(ui?.months).length !== 12) problems.push(`ui.${locale}.months: must have 12 entries`)
  }
}

function buildLocale(locale, translate, { base, profile, ui }) {
  const { meta, ...strings } = ui
  const tiers = profile.bulletTiers ?? {}
  const shown = (bullet) => translate(profile.bulletRewrites?.[bullet] ?? bullet)
  const featured = list(profile.featuredCertifications)
  const rank = (item) => {
    const index = featured.indexOf(item.id)
    return index === -1 ? featured.length : index
  }
  return {
    meta: {
      locale,
      dataDate: base.dataDate,
      siteUrl: profile.site.url,
      path: locale === 'es' ? '/' : '/en',
      title: meta.title,
      description: meta.description,
    },
    person: {
      name: `${base.profile.firstName} ${base.profile.lastName}`,
      headline: translate(profile.headline),
      location: profile.contact.location,
      email: profile.contact.email,
      github: profile.contact.github,
      linkedin: profile.contact.linkedin,
      photo: profile.photo,
      summary: profile.summary.map(translate),
    },
    positions: [...base.positions]
      .sort((a, b) => b.start.localeCompare(a.start))
      .map((position) => ({
        id: position.id,
        title: translate(position.title),
        company: position.company ?? null,
        engagement: position.company ? null : translate(profile.engagements[position.id]),
        location: position.location ?? null,
        start: position.start,
        end: position.end ?? null,
        current: position.current === true,
        bullets: list(tiers[position.id]?.bullets).map(shown),
        moreBullets: list(tiers[position.id]?.moreBullets).map(shown),
      })),
    projects: profile.projects.items.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      description: translate(item.description),
    })),
    education: base.education.map((item) => ({
      id: item.id,
      degree: translate(item.degree),
      school: profile.schoolLabels?.[item.id] ?? item.school,
      start: item.start ?? null,
      end: item.end ?? null,
      inProgress: item.inProgress === true,
    })),
    certifications: [...base.certifications]
      .sort((a, b) => rank(a) - rank(b))
      .map((item) => ({
        id: item.id,
        title: translate(item.title),
        issuer: item.issuer,
        date: item.date ?? null,
        credentialId: item.credentialId ?? null,
        credentialUrl: item.credentialUrl ?? null,
        featured: featured.includes(item.id),
      })),
    skillGroups: profile.skillGroups.map((group) => ({
      id: group.id,
      label: translate(group.label),
      items: group.items.map(translate),
    })),
    languages: [
      ...list(profile.extraLanguages).map((item) => ({
        name: translate(item.name),
        level: item.level ? translate(item.level) : null,
      })),
      ...base.languages.map((item) => ({
        name: translate(item.name),
        // INTENTIONAL: the export's own value is the English one; Spanish comes from the overlay.
        level: !item.proficiency ? null : locale === 'en' ? item.proficiency : profile.languageLevels[item.proficiency],
      })),
    ],
    ui: strings,
  }
}

function guardSummaryLength(locale, content, problems) {
  const length = content.person.summary.join(' ').length
  if (length > SUMMARY_MAX) problems.push(`${locale} summary: ${length} characters, the limit is ${SUMMARY_MAX}`)
}

function failIfAny(problems) {
  if (problems.length > 0) throw new GuardError(problems)
}

/** Validate all inputs and return both locales. Throws GuardError listing every problem found. */
export function buildContent({ base, profile, translations, uiEs, uiEn }) {
  const problems = []
  const inputs = { base, profile, translations, uiEs, uiEn }
  for (const [name, value] of Object.entries(inputs)) findVerified(value, name, problems)
  guardBase(base, problems)
  guardProfile(base, profile, problems)
  guardProjects(profile, problems)
  guardUi(uiEs, uiEn, problems)
  if (!isText(translations?.status)) problems.push('en.json: missing required field "status"')
  requireList(translations?.entries, 'en.json entries', problems)
  failIfAny(problems)

  // Building the Spanish locale records every string the English one has to translate.
  const used = new Set()
  const es = buildLocale('es', (text) => (used.add(text), text), { base, profile, ui: uiEs })

  const entries = new Map()
  for (const entry of translations.entries) {
    if (!isText(entry?.source) || !isText(entry?.en)) {
      problems.push(`en.json: entry needs "source" and "en": ${JSON.stringify(entry)}`)
    } else if (entries.has(entry.source)) {
      problems.push(`en.json: duplicate source "${entry.source}"`)
    } else {
      entries.set(entry.source, entry.en)
    }
  }
  for (const text of used) if (!entries.has(text)) problems.push(`missing translation: "${text}"`)
  for (const source of entries.keys()) if (!used.has(source)) problems.push(`stale translation: "${source}"`)
  guardSummaryLength('es', es, problems)
  failIfAny(problems)

  const en = buildLocale('en', (text) => entries.get(text), { base, profile, ui: uiEn })
  guardSummaryLength('en', en, problems)
  failIfAny(problems)
  return { es, en }
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), 'utf8'))
}

export function loadInputs() {
  return {
    base: readJson('data/base.json'),
    profile: readJson('data/overlays/profile.json'),
    translations: readJson('data/overlays/en.json'),
    uiEs: readJson('data/ui.es.json'),
    uiEn: readJson('data/ui.en.json'),
  }
}

function main() {
  const inputs = loadInputs()
  const { es, en } = buildContent(inputs)
  const outDir = join(ROOT, 'src', 'content')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'es.json'), `${JSON.stringify(es, null, 2)}\n`)
  writeFileSync(join(outDir, 'en.json'), `${JSON.stringify(en, null, 2)}\n`)
  console.log(`src/content: es, en written (${es.positions.length} positions, ${es.certifications.length} certifications; en.json status: ${inputs.translations.status})`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}
