import { describe, expect, it } from 'vitest'
import en from '../src/content/en.json'
import es from '../src/content/es.json'
import { toMonths, toMonthsAfter } from '../src/lib/format'
import { FORM_NAMES, FORMS, layoutRails, layoutTransitMap, textWidth } from '../src/lib/transitMap'

const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ui = { months, present: 'Actualidad', inProgress: 'En curso', sections: { skills: 'Habilidades' } }
const DATA_DATE = '2026-10'

const role = (id, start, end, extra = {}) => ({
  id,
  company: id,
  engagement: null,
  start,
  end,
  current: end === null,
  ...extra,
})

const SKILLS = Array.from({ length: 9 }, (_, index) => ({ id: `g${index}`, label: `Grupo de habilidades ${index}`, items: ['x'] }))
const EDUCATION = [
  { id: 'future', degree: 'Desarrollo de Software', school: 'ISTEA', start: '2025', end: '2027', inProgress: true },
  { id: 'done', degree: 'Analista en Sistemas', school: 'ORT Argentina', start: '2019', end: '2022', inProgress: false },
]

const FIVE = [
  role('Empresa Nueva de Verdad', '2026-09', null),
  role('Noble Seguros', '2020-12', null),
  role('Autónomo', '2018-12', null, { company: null, engagement: 'Profesional independiente' }),
  role('Maratón de Buenos Aires', '2017-10', '2019-10'),
  role('Laboratorio Dr. Enrique Iovine', '2015-04', '2020-11'),
]
const SIX = [role('Consultora Muy Larga de Servicios Globales', '2023-02', '2025-06'), ...FIVE]
const THREE = [FIVE[1], FIVE[2], FIVE[4]]

const CASES = [
  ['3 positions', THREE],
  ['the real 4 positions, shape only', FIVE.slice(1)],
  ['5 positions', FIVE],
  ['6 positions', SIX],
  ['null companies only', FIVE.map((item, index) => ({ ...item, company: null, engagement: `Trabajo ${index}` }))],
  ['all starting within a year', [role('a', '2026-01', null), role('b', '2026-02', null), role('c', '2026-03', null), role('d', '2026-04', null)]],
  ['nothing current', [role('a', '2015-01', '2016-01'), role('b', '2017-01', '2019-01')]],
]

const layout = (positions, form, overrides = {}) =>
  layoutTransitMap({ positions, education: EDUCATION, skillGroups: SKILLS, dataDate: DATA_DATE, ui, ...overrides }, form)

const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

function collisions(map) {
  const found = []
  for (let i = 0; i < map.textBoxes.length; i += 1) {
    for (let j = i + 1; j < map.textBoxes.length; j += 1) {
      if (overlaps(map.textBoxes[i], map.textBoxes[j])) found.push(`${map.textBoxes[i].id} × ${map.textBoxes[j].id}`)
    }
  }
  return found
}

/** Sampled, not exact: fine enough to see a label sitting on a line, and it fails loudly if one does. */
function labelsOnLines(map) {
  const found = []
  for (const box of map.textBoxes) {
    for (const line of map.lines) {
      for (let index = 1; index < line.points.length; index += 1) {
        const [x1, y1] = line.points[index - 1]
        const [x2, y2] = line.points[index]
        for (let t = 0; t <= 1; t += 0.02) {
          const x = x1 + (x2 - x1) * t
          const y = y1 + (y2 - y1) * t
          if (x > box.x && x < box.x + box.w && y > box.y && y < box.y + box.h) found.push(`${box.id} on ${line.id}`)
        }
      }
    }
  }
  return [...new Set(found)]
}

describe.each(FORM_NAMES)('layoutTransitMap, %s form', (form) => {
  describe.each(CASES)('%s', (_name, positions) => {
    const map = layout(positions, form)

    it('draws a station and a line for every role', () => {
      expect(map.stations.map((item) => item.id).sort()).toEqual(positions.map((item) => item.id).sort())
      expect(map.lines).toHaveLength(positions.length)
    })

    it('leaves no label on another label or on a line', () => {
      expect(collisions(map)).toEqual([])
      expect(labelsOnLines(map)).toEqual([])
    })

    it('keeps every label inside the drawing', () => {
      for (const box of map.textBoxes) {
        expect(box.x, box.id).toBeGreaterThanOrEqual(0)
        expect(box.y, box.id).toBeGreaterThanOrEqual(0)
        expect(box.x + box.w, box.id).toBeLessThanOrEqual(map.width)
        expect(box.y + box.h, box.id).toBeLessThanOrEqual(map.height)
      }
    })

    it('never writes a null or undefined', () => {
      expect(JSON.stringify(map.stations.map((item) => item.lines))).not.toMatch(/null|undefined/)
    })
  })

  it('places stations to scale: equal time, equal distance', () => {
    const map = layout(FIVE, form)
    const coordinate = FORMS[form].orientation === 'horizontal' ? 'x' : 'y'
    const position = (id) => map.stations.find((item) => item.id === id)[coordinate]
    const perMonth = (a, startA, b, startB) => (position(a) - position(b)) / (toMonths(startA) - toMonths(startB))
    const ratio = perMonth('Noble Seguros', '2020-12', 'Laboratorio Dr. Enrique Iovine', '2015-04')
    expect(perMonth('Maratón de Buenos Aires', '2017-10', 'Laboratorio Dr. Enrique Iovine', '2015-04')).toBeCloseTo(ratio, 1)
    expect(perMonth('Autónomo', '2018-12', 'Laboratorio Dr. Enrique Iovine', '2015-04')).toBeCloseTo(ratio, 1)
    expect(map.stations.filter((item) => item.atRim).map((item) => item.id)).toEqual(['Empresa Nueva de Verdad'])
  })

  it('holds a role that just started at the rim of the portrait, never on the face', () => {
    const map = layout(FIVE, form)
    const station = map.stations.find((item) => item.id === 'Empresa Nueva de Verdad')
    const distance = Math.hypot(station.x - map.portrait.x, station.y - map.portrait.y)
    expect(distance).toBeGreaterThanOrEqual(map.portrait.r + station.r)
    expect(map.stations.find((item) => item.id === 'Noble Seguros').atRim).toBe(false)
  })

  it('puts a year tick on every year of the span, evenly', () => {
    const { ticks } = layout(FIVE, form).axis
    expect(ticks[0].year).toBe(2015)
    expect(ticks[ticks.length - 1].year).toBe(2027)
    const coordinate = FORMS[form].orientation === 'horizontal' ? 'x' : 'y'
    const gaps = ticks.slice(1).map((tick, index) => tick[coordinate] - ticks[index][coordinate])
    for (const gap of gaps) expect(Math.abs(gap - gaps[0])).toBeLessThan(0.3)
  })

  it('is deterministic, because the server and the browser must agree', () => {
    expect(layout(SIX, form)).toEqual(layout(SIX, form))
  })

  it('skips a degree with no dates and keeps a partial one', () => {
    const education = [
      { id: 'none', degree: 'Sin fechas', school: 'X', start: null, end: null, inProgress: false },
      { id: 'partial', degree: 'Solo inicio', school: 'Y', start: '2019', end: null, inProgress: true },
    ]
    const map = layout(FIVE, form, { education })
    expect(map.studies.map((item) => item.id)).toEqual(['partial'])
  })

  it('fails loudly on a bad date or a role with no name', () => {
    expect(() => layout([role('a', 'soon', null)], form)).toThrow()
    expect(() => layout([role('a', '2020-01', null, { company: null })], form)).toThrow(/neither company nor engagement/)
    expect(() => layout([role('a', '2020-01', null, { current: false })], form)).toThrow()
  })
})

describe('lanes', () => {
  const stationLane = (map, id) => map.lines.find((line) => line.id === id)

  it('runs overlapping roles on parallel lines and hands a lane on between adjacent ones', () => {
    const { rows, laneCount } = layoutRails(FIVE.slice(1), DATA_DATE, ui)
    const lane = (id) => rows.find((row) => row.id === id).lane
    expect(laneCount).toBe(3)
    expect(lane('Noble Seguros')).toBe(lane('Laboratorio Dr. Enrique Iovine'))
    expect(lane('Noble Seguros')).not.toBe(lane('Autónomo'))
    expect(lane('Maratón de Buenos Aires')).not.toBe(lane('Laboratorio Dr. Enrique Iovine'))
    expect(lane('Maratón de Buenos Aires')).not.toBe(lane('Autónomo'))
  })

  it('takes a new lane for each role that overlaps all the others', () => {
    const overlapAll = [role('a', '2020-01', null), role('b', '2021-01', null), role('c', '2022-01', null), role('d', '2023-01', null), role('e', '2024-01', null)]
    expect(layoutRails(overlapAll, DATA_DATE, ui).laneCount).toBe(5)
  })

  it('makes room above the ribbon for a long name on the accent line', () => {
    const long = [role('Una Empresa Nueva con un Nombre Bastante Largo S.A.', '2026-09', null), ...FIVE.slice(1)]
    const map = layout(long, 'wide')
    expect(map.usedFallback).toBe(false)
    const label = map.textBoxes.find((box) => box.id === long[0].id)
    expect(label.y).toBeLessThan(map.portrait.y)
  })

  it('sends every current role to the portrait, and past ones stop at their end date', () => {
    const map = layout(FIVE, 'wide')
    const lastX = (id) => stationLane(map, id).points.at(-1)[0]
    expect(lastX('Noble Seguros')).toBeCloseTo(map.portrait.x, 0)
    expect(lastX('Empresa Nueva de Verdad')).toBeCloseTo(map.portrait.x, 0)
    expect(lastX('Maratón de Buenos Aires')).toBeLessThan(map.stations.find((item) => item.id === 'Noble Seguros').x)
  })

  it('makes the newest current role the accent line', () => {
    const { rows } = layoutRails(FIVE, DATA_DATE, ui)
    expect(rows.filter((row) => row.style === 'accent').map((row) => row.id)).toEqual(['Empresa Nueva de Verdad'])
    expect(rows.find((row) => row.id === 'Noble Seguros').style).toBe('solid')
  })

  it('keeps parallel lines apart along the whole ribbon', () => {
    const map = layout(FIVE.slice(1), 'wide')
    const noble = stationLane(map, 'Noble Seguros').points
    const self = stationLane(map, 'Autónomo').points
    expect(Math.abs(noble.at(-1)[1] - self.at(-1)[1])).toBeCloseTo(FORMS.wide.laneGap, 0)
  })
})

describe('education on the map', () => {
  it('draws a bare-year period from tick to tick', () => {
    const map = layout(FIVE, 'wide')
    const tick = (year) => map.axis.ticks.find((item) => item.year === year).x
    expect(map.studies.find((item) => item.id === 'done').d).toMatch(new RegExp(`^M${tick(2019)} [\\d.]+L${tick(2022)} `))
  })

  it('stays clear of month rounding: a month-precise end runs through that month', () => {
    expect(toMonthsAfter('2020-11')).toBe(toMonths('2020-12'))
    const map = layout(FIVE, 'wide', { education: [{ id: 'm', degree: 'D', school: 'S', start: '2019-03', end: '2020-11', inProgress: false }] })
    expect(map.studies).toHaveLength(1)
  })
})

describe('skill branches', () => {
  const rowsOf = (form, count) => layout(FIVE, form, { skillGroups: SKILLS.slice(0, count) }).branches.rows

  it.each(['wide', 'mid', 'tablet'])('gives each group its own branch in %s, however many there are', (form) => {
    for (const count of [1, 2, 5, 9, 12]) {
      const skillGroups = Array.from({ length: count }, (_, index) => ({ id: `g${index}`, label: `Grupo ${index}`, items: [] }))
      const rows = layout(FIVE, form, { skillGroups }).branches.rows
      expect(rows.map((row) => row.href)).toEqual(skillGroups.map((group) => `#skill-${group.id}`))
      const ys = rows.map((row) => row.dot[1])
      expect(new Set(ys).size).toBe(count)
    }
  })

  it('folds into one link to the section on a phone, where nine rows cannot fit', () => {
    const rows = rowsOf('phone', 9)
    expect(rows).toHaveLength(1)
    expect(rows[0].href).toBe('#skills')
    expect(rows[0].text).toBe('Habilidades')
  })
})

describe('layoutRails', () => {
  it('opens a line at the first entry it was active for and ends it on its own entry', () => {
    const { rows } = layoutRails(FIVE.slice(1), DATA_DATE, ui)
    const row = (id) => rows.find((item) => item.id === id)
    expect(row('Noble Seguros').tracks.map((track) => track.id)).toEqual(['Noble Seguros', 'Autónomo'])
    expect(row('Autónomo').tracks.map((track) => track.id)).toEqual(['Autónomo', 'Maratón de Buenos Aires', 'Laboratorio Dr. Enrique Iovine'])
    expect(row('Laboratorio Dr. Enrique Iovine').tracks.map((track) => track.id)).toEqual(['Laboratorio Dr. Enrique Iovine'])
    expect(row('Laboratorio Dr. Enrique Iovine').tracks[0].ends).toBe(true)
    expect(row('Noble Seguros').tracks.find((track) => track.id === 'Autónomo').ends).toBe(false)
  })

  it('never puts two tracks on one lane in an entry', () => {
    for (const positions of [THREE, FIVE, SIX]) {
      for (const row of layoutRails(positions, DATA_DATE, ui).rows) {
        const lanes = row.tracks.map((track) => track.lane)
        expect(new Set(lanes).size).toBe(lanes.length)
      }
    }
  })
})

describe('the real content', () => {
  describe.each([['es', es], ['en', en]])('%s', (_locale, content) => {
    it.each(FORM_NAMES)('lays out clean in %s, and with one more current role', (form) => {
      const input = { positions: content.positions, education: content.education, skillGroups: content.skillGroups, dataDate: content.meta.dataDate, ui: content.ui }
      const map = layoutTransitMap(input, form)
      expect(collisions(map)).toEqual([])
      expect(labelsOnLines(map)).toEqual([])

      // A new job next month is only a new row of data: this is the requirement, so it is tested on the real entries.
      const next = { ...input, positions: [{ ...content.positions[1], id: 'next', company: 'Un Empleador Nuevo', engagement: null, start: content.meta.dataDate, end: null, current: true }, ...content.positions] }
      const grown = layoutTransitMap(next, form)
      expect(grown.stations).toHaveLength(content.positions.length + 1)
      expect(collisions(grown)).toEqual([])
      expect(labelsOnLines(grown)).toEqual([])
    })
  })
})

describe('textWidth', () => {
  it('grows with size and treats caps as wider', () => {
    expect(textWidth('Noble', 20, 'display')).toBeLessThan(textWidth('Noble', 40, 'display'))
    expect(textWidth('Noble', 20, 'display')).toBeLessThan(textWidth('Noble', 20, 'caps'))
  })
})
