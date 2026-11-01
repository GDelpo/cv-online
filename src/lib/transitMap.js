// The career map as pure geometry: dates and labels in, coordinates out. Nothing here knows about React or the DOM, and
// nothing about who the roles are: a new position in the locale JSON lays itself out. See tests/transit-map.test.js.

import { formatDate, formatEnd, toMonths, toMonthsAfter } from '@/lib/format'

/** Offsetting a line through a 45 degree bend moves its corners along the line by this much per unit of offset. */
const BEND = Math.tan(Math.PI / 8)
const round = (value) => Math.round(value * 10) / 10

/**
 * One SVG per form; CSS shows the one that fits the viewport. A viewBox scales its text with it, so each form is laid
 * out for the width it is shown at, which is what keeps the labels readable. Sizes are in viewBox units.
 */
export const FORMS = {
  wide: {
    orientation: 'horizontal', width: 1440, margin: 60, axisEnd: 948, dotX: 1170, rowGap: 45, rowSize: 23,
    laneGap: 34, radius: 58, disc: 20, bigDisc: 23, nameSize: 26, bigSize: 46, dateSize: 15, eduSize: 15, yearSize: 15,
    climb: 170, band: 100, bandRight: 1130, trunk: 17,
  },
  mid: {
    orientation: 'horizontal', width: 1000, margin: 28, axisEnd: 640, dotX: 760, rowGap: 33, rowSize: 20,
    laneGap: 27, radius: 46, disc: 16, bigDisc: 19, nameSize: 22, bigSize: 34, dateSize: 14, eduSize: 14, yearSize: 13,
    climb: 110, band: 0, bandRight: 0, trunk: 13,
  },
  tablet: {
    orientation: 'vertical', width: 720, margin: 16, axisRight: 56, eduX: 306, labelX: 324, dotX: 462, rowGap: 31,
    rowSize: 22, pxYear: 46, laneGap: 26, radius: 62, disc: 19, bigDisc: 23, nameSize: 28, bigSize: 40, dateSize: 15,
    eduSize: 15, yearSize: 14, climb: 70, trunk: 16,
  },
  phone: {
    orientation: 'vertical', width: 390, margin: 10, axisRight: 38, eduX: 158, labelX: 172, dotX: 238, rowGap: 34,
    rowSize: 22, pxYear: 42, laneGap: 18, radius: 46, disc: 15, bigDisc: 17, nameSize: 22, bigSize: 28, dateSize: 13,
    eduSize: 13, yearSize: 12, climb: 36, trunk: 12, collapseBranches: true,
  },
}
export const FORM_NAMES = Object.keys(FORMS)

// Estimated advance widths in em. Deliberately a little wide: the check in the browser compares them with real boxes.
const NARROW = /[iIjlt.,;:'!|·()\-–]/
const WIDE = /[mwMW&@]/
const UPPER = /[A-ZÁÉÍÓÚÑ]/
const FONT_WIDTHS = {
  display: { space: 0.2, narrow: 0.25, wide: 0.66, upper: 0.5, other: 0.43 },
  caps: { space: 0.21, narrow: 0.3, wide: 0.72, upper: 0.54, other: 0.54 },
  body: { space: 0.27, narrow: 0.32, wide: 0.88, upper: 0.68, other: 0.59 },
}

export function textWidth(text, size, font) {
  const widths = FONT_WIDTHS[font]
  let total = 0
  for (const char of font === 'caps' ? text.toUpperCase() : text) {
    if (char === ' ') total += widths.space
    else if (NARROW.test(char)) total += widths.narrow
    else if (WIDE.test(char)) total += widths.wide
    else if (UPPER.test(char)) total += widths.upper
    else total += widths.other
  }
  return total * size
}

function wrapWords(text, size, font, maxWidth) {
  const lines = []
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && textWidth(`${last} ${word}`, size, font) <= maxWidth) lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  return lines
}

/** A single word can be wider than the room there is; only then does the type shrink, because it cannot wrap. */
function fitSize(text, size, font, maxWidth) {
  const longest = Math.max(...text.split(' ').map((word) => textWidth(word, size, font)))
  return longest > maxWidth ? (size * maxWidth) / longest : size
}

/* ---------- time and lanes ---------- */

const periodOf = (position, ui) =>
  `${formatDate(position.start, ui.months)} – ${formatEnd(position.end, position.current, ui)}`

export const employerOf = (position) => {
  const name = position.company ?? position.engagement
  if (!name) throw new Error(`position ${position.id} has neither company nor engagement`)
  return name
}

/**
 * Lanes hold roles that never run at the same time, so a parallel line on the map always means real overlap. Lanes with
 * a current role are kept together so they reach the portrait side by side; the rest go on the outside, alternating.
 */
function assignLanes(roles) {
  const byStart = [...roles].sort((a, b) => a.from - b.from || a.id.localeCompare(b.id))
  const raw = []
  for (const role of byStart) {
    // INTENTIONAL: touching is allowed, so a role that ends in November hands its lane to one starting in December.
    let lane = raw.findIndex((members) => members[members.length - 1].to <= role.from)
    if (lane === -1) lane = raw.push([]) - 1
    raw[lane].push(role)
  }
  const isCurrent = (members) => members.some((role) => role.current)
  const latest = (members) => members[members.length - 1].from
  const newestFirst = (a, b) => latest(b) - latest(a)
  const current = raw.filter(isCurrent).sort(newestFirst)
  const past = raw.filter((members) => !isCurrent(members)).sort(newestFirst)
  const above = past.filter((_, index) => index % 2 === 0).reverse()
  const below = past.filter((_, index) => index % 2 === 1)
  const ordered = [...above, ...current, ...below]
  ordered.forEach((members, lane) => members.forEach((role) => (role.lane = lane)))
  const center = current.length > 0 ? above.length + (current.length - 1) / 2 : (ordered.length - 1) / 2
  return { laneCount: ordered.length, center }
}

/** The newest current role is the accent line. Past roles alternate two outlined styles, oldest first. */
function assignStyles(roles) {
  const newest = [...roles].sort((a, b) => b.from - a.from)
  const primary = newest.find((role) => role.current) ?? newest[0]
  const past = roles.filter((role) => !role.current && role !== primary).sort((a, b) => a.from - b.from)
  for (const role of roles) role.style = role === primary ? 'accent' : 'solid'
  past.forEach((role, index) => (role.style = index % 2 === 0 ? 'hollow' : 'dashed'))
  primary.primary = true
}

function buildRoles(positions, now, ui) {
  const roles = positions.map((position) => ({
    id: position.id,
    name: employerOf(position),
    period: periodOf(position, ui),
    from: toMonths(position.start),
    to: position.current ? now : toMonthsAfter(position.end),
    current: position.current === true,
  }))
  return { roles, ...assignLanes(roles), styled: assignStyles(roles) }
}

/**
 * INTENTIONAL: a bare year sits on its tick, so "2019 - 2022" spans exactly from tick to tick as the text says. LinkedIn
 * gives degrees in years, and through December would draw an unknown month as if it were known. A partial period is
 * still drawn from what exists; a degree with no dates stays off the map and in the list below it.
 */
function buildStudies(education, now) {
  const pointAt = (value) => (value.length > 4 ? toMonthsAfter(value) : toMonths(value))
  return education.flatMap((item) => {
    if (!item.start && !item.end) return []
    const from = item.start ? toMonths(item.start) : pointAt(item.end)
    const to = item.end ? pointAt(item.end) : item.inProgress ? now : from
    return [{ id: item.id, degree: item.degree, school: item.school, inProgress: item.inProgress, from, to }]
  })
}

/* ---------- the ribbon: every line follows the same climbing path, so they stay parallel and never cross ---------- */

function buildRamps(starts, budget, pad) {
  const stops = [...new Set(starts)].sort((a, b) => a - b)
  const room = []
  let cursor = stops[0] + 14
  for (const stop of stops.slice(1)) {
    room.push({ to: stop - pad, room: Math.max(0, stop - pad - cursor - 8), height: 0 })
    cursor = Math.max(cursor, stop - pad)
  }
  const open = room.filter((ramp) => ramp.room >= 14)
  let left = budget
  for (let pass = 0; pass < 3 && left > 0.5; pass += 1) {
    const growing = open.filter((ramp) => ramp.height < ramp.room)
    if (growing.length === 0) break
    const share = left / growing.length
    for (const ramp of growing) {
      const take = Math.min(share, ramp.room - ramp.height)
      ramp.height += take
      left -= take
    }
  }
  return open.map((ramp) => ({ from: ramp.to - ramp.height, to: ramp.to, height: ramp.height }))
}

function makeRibbon(ramps) {
  const total = ramps.reduce((sum, ramp) => sum + ramp.height, 0)
  const corners = (offset) => {
    const shift = BEND * offset
    let level = total
    return ramps.flatMap((ramp) => {
      const start = [ramp.from + shift, level + offset]
      level -= ramp.height
      return [start, [ramp.to + shift, level + offset]]
    })
  }
  const at = (along, offset) => {
    const points = corners(offset)
    if (points.length === 0) return offset
    if (along <= points[0][0]) return points[0][1]
    for (let index = 1; index < points.length; index += 1) {
      const [x1, v1] = points[index]
      if (along <= x1) {
        const [x0, v0] = points[index - 1]
        return x1 === x0 ? v1 : v0 + ((v1 - v0) * (along - x0)) / (x1 - x0)
      }
    }
    return points[points.length - 1][1]
  }
  const path = (from, to, offset) => [
    [from, at(from, offset)],
    ...corners(offset).filter(([along]) => along > from && along < to),
    [to, at(to, offset)],
  ]
  return { total, at, path }
}

const toPath = (points) =>
  points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${round(x)} ${round(y)}`).join('')

/* ---------- collision checks ---------- */

const boxesTouch = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

function segmentHitsBox([x1, y1], [x2, y2], box, pad) {
  const left = box.x - pad
  const right = box.x + box.w + pad
  const top = box.y - pad
  const bottom = box.y + box.h + pad
  let enter = 0
  let leave = 1
  const dx = x2 - x1
  const dy = y2 - y1
  for (const [p, q] of [[-dx, x1 - left], [dx, right - x1], [-dy, y1 - top], [dy, bottom - y1]]) {
    if (p === 0) {
      if (q < 0) return false
    } else {
      const t = q / p
      if (p < 0) enter = Math.max(enter, t)
      else leave = Math.min(leave, t)
      if (enter > leave) return false
    }
  }
  return true
}

class Field {
  boxes = []
  segments = []

  addBox(box) {
    this.boxes.push(box)
  }

  addPolyline(points, pad) {
    for (let index = 1; index < points.length; index += 1) {
      this.segments.push({ a: points[index - 1], b: points[index], pad })
    }
  }

  isFree(box) {
    return (
      !this.boxes.some((other) => boxesTouch(box, other)) &&
      !this.segments.some(({ a, b, pad }) => segmentHitsBox(a, b, box, pad))
    )
  }
}

const grow = (box, by) => ({ x: box.x - by, y: box.y - by, w: box.w + by * 2, h: box.h + by * 2 })
const circleBox = (x, y, r) => ({ x: x - r, y: y - r, w: r * 2, h: r * 2 })

/* ---------- labels ---------- */

const NAME_LEADING = 1.02
const DATE_LEADING = 1.35

function stationBlock(role, form, maxWidth, big, wrap) {
  const font = big ? 'caps' : 'display'
  const wanted = big ? form.bigSize : form.nameSize
  const size = fitSize(role.name, wanted, font, maxWidth)
  const names = wrap ? wrapWords(role.name, size, font, maxWidth) : [role.name]
  const width = Math.max(
    ...names.map((line) => textWidth(line, size, font)),
    textWidth(role.period, form.dateSize, 'body'),
  )
  const height = names.length * size * NAME_LEADING + form.dateSize * DATE_LEADING
  return { names, size, width, height, big, period: role.period }
}

function blockLines(block, x, top, form) {
  const nameClass = block.big ? 'tm-big' : 'tm-name'
  const lines = block.names.map((text, index) => ({
    x: round(x),
    y: round(top + block.size * 0.84 + index * block.size * NAME_LEADING),
    size: round(block.size),
    parts: [{ text, className: nameClass }],
  }))
  return lines
    .concat({
      x: round(x),
      y: round(top + block.names.length * block.size * NAME_LEADING + form.dateSize * 1.05),
      size: form.dateSize,
      parts: [{ text: block.period, className: 'tm-date' }],
    })
}

function studyParts(study, ui) {
  const parts = [{ text: study.degree, className: 'tm-edu-strong' }, { text: ` · ${study.school}`, className: 'tm-edu' }]
  if (study.inProgress) parts.push({ text: ` · ${ui.inProgress}`, className: 'tm-edu-tag' })
  return parts
}

const partsWidth = (parts, size) => parts.reduce((sum, part) => sum + textWidth(part.text, size, 'body'), 0)

/** Skill branches leave the portrait on a shared trunk and peel off at their row; the first half is the accent side. */
function buildBranches(form, cx, cy, radius, skillGroups, ui) {
  const fanStart = cx + radius + 8
  const toDot = form.dotX - 8
  const labelX = form.dotX + 20
  const room = form.width - labelX - form.margin / 2

  if (form.collapseBranches) {
    const rail = [[cx, cy], [form.dotX, cy]]
    const text = ui.sections.skills
    const elbow = cx + radius + 4
    const stub = (direction) => [[cx, cy], [elbow, cy], [elbow + 18, cy + direction * 18], [toDot - 6, cy + direction * 18]]
    return {
      decor: [{ points: stub(-1), accent: true }, { points: stub(1), accent: false }],
      rows: [{
        id: 'skills', href: '#skills', points: rail, accent: false, dot: [form.dotX, cy], text,
        labelX, labelY: cy, size: fitSize(text, form.rowSize, 'display', room),
      }],
    }
  }

  const count = skillGroups.length
  // In the vertical forms the column below the portrait belongs to the timeline, so the fan only opens upward.
  const upward = form.orientation === 'vertical'
  const widest = Math.max(...skillGroups.map((group) => textWidth(group.label, form.rowSize, 'display')))
  const size = widest > room ? (form.rowSize * room) / widest : form.rowSize
  const center = upward ? count - 1 : (count - 1) / 2
  const reach = center * form.rowGap
  const slope = Math.min(1, (toDot - fanStart - 10) / Math.max(reach, 1))
  const rows = skillGroups.map((group, index) => {
    const rowY = cy + (index - center) * form.rowGap
    const side = Math.sign(round(rowY - cy))
    const startY = cy + side * form.trunk
    const bendX = fanStart + Math.abs(rowY - startY) * slope
    return {
      id: group.id,
      href: `#skill-${group.id}`,
      points: [[cx, startY], [fanStart, startY], [bendX, rowY], [form.dotX, rowY]],
      accent: upward ? index < count / 2 : side < 0,
      main: index === 0,
      dot: [form.dotX, rowY],
      text: group.label,
      labelX,
      labelY: rowY,
      size: round(size),
    }
  })
  return { decor: [], rows }
}

const rowBox = (row) => {
  const height = row.size * 1.2
  return {
    x: row.dot[0] - 10,
    y: row.labelY - Math.max(height / 2, 10),
    w: 30 + textWidth(row.text, row.size, 'display'),
    h: Math.max(height, 20),
  }
}

/* ---------- shared set-up ---------- */

function timeline(roles, studies, now) {
  const months = [...roles.map((role) => role.from), ...studies.map((study) => study.from)]
  const ends = [now, ...studies.map((study) => study.to)]
  const firstYear = Math.floor(Math.min(...months, now) / 12)
  const lastYear = Math.ceil(Math.max(...ends) / 12)
  return { firstYear, lastYear: Math.max(lastYear, firstYear + 1) }
}

function buildNetwork(input) {
  const { positions, education, dataDate, ui } = input
  const now = toMonthsAfter(dataDate)
  const { roles, laneCount, center } = buildRoles(positions, now, ui)
  const studies = buildStudies(education, now)
  return { now, roles, laneCount, center, studies, ...timeline(roles, studies, now) }
}

/**
 * INTENTIONAL: the one place the map leaves the scale. A role that started in the last months would put its stop on the
 * portrait's face, so it waits at the rim instead, and its label still gives the real date. Every other date is exact.
 */
const startAlong = (role, along, nowAlong, radius, form) =>
  Math.min(along(role.from), nowAlong - radius - (role.primary ? form.bigDisc : form.disc) - 5)

function drawnLines(net, ribbon, along, startOf, offsetOf, width, project) {
  return net.roles.map((role, index) => {
    const from = startOf(role)
    return {
      id: role.id,
      index,
      style: role.style,
      width: round(width),
      points: ribbon.path(from, Math.max(from, along(role.to)), offsetOf(role)).map(project),
    }
  })
}

const finishLine = ({ points, ...line }) => ({ ...line, d: toPath(points), points })

/* ---------- horizontal form ---------- */

function layoutHorizontal(input, form, net, extraHeadroom = 0) {
  const { skillGroups, ui } = input
  const pxYear = (form.axisEnd - form.margin) / (net.lastYear - net.firstYear)
  const along = (months) => form.margin + ((months - net.firstYear * 12) / 12) * pxYear
  const lineWidth = form.laneGap * 0.76
  const offsetOf = (role) => (role.lane - net.center) * form.laneGap
  const offsets = net.roles.map(offsetOf)
  const pad = BEND * Math.max(...offsets.map(Math.abs)) + 8
  const currentOffsets = net.roles.filter((role) => role.current).map(offsetOf)
  const stack = currentOffsets.length ? Math.max(...currentOffsets.map(Math.abs)) : 0
  const radius = Math.max(form.radius, stack + lineWidth / 2 + 10)
  const startOf = (role) => startAlong(role, along, along(net.now), radius, form)
  const ribbon = makeRibbon(buildRamps(net.roles.map(startOf), form.climb, pad))

  const rowsHalf = form.collapseBranches ? 0 : ((skillGroups.length - 1) / 2) * form.rowGap
  const headroom = form.bigSize * 1.02 + form.dateSize * DATE_LEADING + form.bigDisc + 18 + extraHeadroom
  const cy = Math.max(form.band + headroom + Math.max(0, -Math.min(...offsets)), rowsHalf + 22, radius + 34)
  const cx = along(net.now)
  const project = ([u, v]) => [u, cy + v]

  const lines = drawnLines(net, ribbon, along, startOf, offsetOf, lineWidth, project).map(finishLine)
  const branches = buildBranches(form, cx, cy, radius, skillGroups, ui)

  const field = new Field()
  if (form.band > 0) field.addBox({ x: 0, y: 0, w: form.bandRight, h: form.band })
  const textBoxes = []
  const place = (id, box) => {
    field.addBox(box)
    textBoxes.push({ id, ...box })
  }
  for (const line of lines) field.addPolyline(line.points, line.width / 2 + 5)
  for (const { points } of [...branches.rows, ...branches.decor]) field.addPolyline(points, 7)
  for (const row of branches.rows) field.addBox(rowBox(row))
  field.addBox(circleBox(cx, cy, radius + 6))

  const stations = net.roles.map((role, index) => {
    const x = startOf(role)
    const offset = offsetOf(role)
    const y = cy + ribbon.at(x, offset)
    const disc = role.primary ? form.bigDisc : form.disc
    field.addBox(circleBox(x, y, disc + 4))
    return { role, index, x, y, disc, offset, atRim: x < along(role.from) }
  })

  const nowWidth = textWidth(ui.present, form.nameSize, 'display')
  const nowBox = {
    x: cx - nowWidth / 2,
    y: cy - radius - 8 - form.nameSize * NAME_LEADING,
    w: nowWidth,
    h: form.nameSize * NAME_LEADING,
  }
  place('now', nowBox)

  const baseline = Math.max(...lines.flatMap((line) => line.points.map(([, y]) => y + line.width / 2)))
  const rowHeight = form.eduSize * 1.35 + 22
  const labelLimit = form.dotX - 12
  const studies = [...net.studies]
    .sort((a, b) => a.from - b.from || a.id.localeCompare(b.id))
    .map((study) => {
      const x1 = along(study.from)
      const x2 = along(study.to)
      const parts = studyParts(study, ui)
      const w = partsWidth(parts, form.eduSize)
      const right = Math.max(form.margin / 2, labelLimit - w)
      // The label slides back along its own line before the whole line drops a row, which would make the map taller.
      for (let row = 0; ; row += 1) {
        const top = baseline + 10 + row * rowHeight
        const dotsY = top + form.eduSize * 1.35 + 10
        const dots = [[x1, dotsY], [x2, dotsY]]
        const lane = { x: x1 - 6, y: dotsY - 6, w: x2 - x1 + 12, h: 12 }
        if (field.isFree(lane)) {
          for (let shift = 0; shift <= 240; shift += 20) {
            const x = Math.max(form.margin / 2, Math.min(x1, right) - shift)
            const box = { x, y: top, w, h: form.eduSize * 1.35 }
            if (field.isFree(grow(box, 3))) {
              place(study.id, box)
              field.addPolyline(dots, 6)
              return {
                id: study.id,
                d: toPath(dots),
                bottom: dotsY + 4,
                lines: [{ x: round(x), y: round(top + form.eduSize * 1.02), size: form.eduSize, parts }],
              }
            }
          }
        }
      }
    })

  let usedFallback = false
  const placeStation = ({ role, index, x, y, disc, offset, atRim }) => {
    const big = role.primary === true
    const preferAbove = offset <= 0
    const named = { name: role.name, period: role.period }
    const blocks = [stationBlock(named, form, form.width, big, false)]
    for (const wrapAt of big ? [form.width * 0.26, form.width * 0.16] : [form.width * 0.14]) {
      const wrapped = stationBlock(named, form, wrapAt, big, true)
      if (wrapped.names.length > blocks[blocks.length - 1].names.length) blocks.push(wrapped)
    }
    const steps = [0, 10, 20, 30, 44, 58, 76, 96, 120, 150]
    const shifts = [0, -24, -48, -72, -100, -130, -170, -220, -280, -340, -400, 24, 48]
    // A leader must never run through text, and the label it serves is the only one it may touch.
    const leaderClear = (box, above) => {
      const edge = [Math.max(box.x, Math.min(x, box.x + box.w)), above ? box.y + box.h : box.y]
      return !textBoxes.some((other) => segmentHitsBox([x, y], edge, other, 2))
    }
    let best = null
    for (const block of blocks) {
      for (const above of [true, false]) {
        for (const extra of steps) {
          for (const shift of shifts) {
            const left = Math.max(form.margin / 2, Math.min(x - disc + shift, labelLimit - block.width))
            const top = above ? y - disc - 6 - extra - block.height : y + disc + 6 + extra
            const box = { x: left, y: top, w: block.width, h: block.height }
            if (top < 4 || !field.isFree(grow(box, 3)) || !leaderClear(box, above)) continue
            const score =
              extra + Math.abs(left - (x - disc)) * 0.45 + (above === preferAbove ? 0 : 26) + (block.names.length - 1) * 18
            if (!best || score < best.score) best = { score, block, box, above, extra, left }
          }
        }
      }
    }
    if (!best) {
      // INTENTIONAL: the map grows rather than overlap; below everything there is always room.
      usedFallback = true
      const block = blocks[blocks.length - 1]
      let top = y + disc + 6
      const left = Math.max(form.margin / 2, Math.min(x - disc, labelLimit - block.width))
      const box = () => ({ x: left, y: top, w: block.width, h: block.height })
      // INTENTIONAL: the leader rule gives up after a while. A leader can be blocked at every depth, and text overlap
      // is the rule that may never break, so that one alone decides when the search ends.
      for (let tries = 0; !field.isFree(grow(box(), 3)) || (tries < 60 && !leaderClear(box(), false)); tries += 1) top += 12
      best = { block, box: box(), above: false, extra: top - y, left }
    }
    place(role.id, best.box)
    const needsLeader = best.extra > 6 || best.box.x > x + disc || best.box.x + best.box.w < x - disc
    const edgeY = best.above ? best.box.y + best.box.h + 1 : best.box.y - 1
    const edgeX = Math.max(best.box.x, Math.min(x, best.box.x + best.box.w))
    if (needsLeader) field.addPolyline([[x, y], [edgeX, edgeY]], 3)
    return {
      id: role.id, index, style: role.style, big, atRim, x: round(x), y: round(y), r: disc,
      letter: Array.from(role.name)[0].toUpperCase(),
      name: role.name,
      period: role.period,
      lines: blockLines(best.block, best.left, best.box.y, form),
      frame: best.box,
      leader: needsLeader ? toPath([[x, y], [edgeX, edgeY]]) : null,
    }
  }

  // The accent role picks first, then newest to oldest: the labels a reader wants first get the best spots.
  const placedStations = [...stations]
    .sort((a, b) => Number(b.role.primary === true) - Number(a.role.primary === true) || b.role.from - a.role.from)
    .map(placeStation)
    .sort((a, b) => a.index - b.index)

  const bottomLimit = Math.max(
    baseline,
    cy + radius + 6,
    ...textBoxes.filter((box) => box.id !== 'now').map((box) => box.y + box.h),
    ...studies.map((study) => study.bottom),
  )
  const axisY = bottomLimit + 18
  const ticks = []
  for (let year = net.firstYear; year <= net.lastYear; year += 1) {
    const x = along(year * 12)
    ticks.push({
      year, tick: toPath([[x, axisY - 6], [x, axisY + 6]]), x: round(x), y: round(axisY + 6 + form.yearSize * 1.25), anchor: 'middle',
    })
  }
  const rowsBottom = Math.max(...branches.rows.map((row) => row.labelY + 20))
  const height = Math.ceil(Math.max(axisY + 6 + form.yearSize * 1.8, rowsBottom + 10))

  return {
    orientation: 'horizontal',
    usedFallback,
    width: form.width,
    height,
    size: { year: form.yearSize, row: form.rowSize },
    axis: { d: toPath([[along(net.firstYear * 12), axisY], [along(net.lastYear * 12), axisY]]), ticks },
    lines,
    stations: placedStations,
    studies,
    portrait: { x: round(cx), y: round(cy), r: round(radius) },
    now: {
      lines: [{
        x: round(nowBox.x), y: round(nowBox.y + form.nameSize * 0.84), size: form.nameSize,
        parts: [{ text: ui.present, className: 'tm-name' }],
      }],
      leader: null,
    },
    branches: finishBranches(branches),
    textBoxes,
    segments: field.segments,
    along: { axis: 'x', origin: along(net.firstYear * 12), pxYear, firstYear: net.firstYear },
  }
}

const finishBranches = ({ rows, decor }) => ({
  rows: rows.map(({ points, labelX, labelY, ...row }) => ({
    ...row, d: toPath(points), points, label: { x: round(labelX), y: round(labelY) }, frame: rowBox({ ...row, labelY }),
  })),
  decor: decor.map(({ points, accent }) => ({ d: toPath(points), points, accent })),
})

/* ---------- vertical form ---------- */

function layoutVertical(input, form, net) {
  const { skillGroups, ui } = input
  const pxYear = form.pxYear
  const along = (months) => ((months - net.firstYear * 12) / 12) * pxYear
  const trackLeft = form.axisRight + 8
  const room = form.eduX - 10 - trackLeft - form.climb
  const laneGap = Math.max(9, Math.min(form.laneGap, room / Math.max(net.laneCount, 1)))
  const lineWidth = laneGap * 0.76
  const offsetOf = (role) => (role.lane - net.center) * laneGap
  const offsets = net.roles.map(offsetOf)
  const pad = BEND * Math.max(...offsets.map(Math.abs)) + 8
  const nowAlong = along(net.now)
  const startOf = (role) => startAlong(role, along, nowAlong, form.radius, form)
  const ribbon = makeRibbon(buildRamps(net.roles.map(startOf), form.climb, pad))
  const maxBelow = Math.max(0, ...offsets)
  const cx = Math.max(trackLeft + ribbon.total + maxBelow + lineWidth / 2, trackLeft + form.radius - 4)
  const radius = Math.max(16, Math.min(form.radius, form.eduX - 8 - cx))
  const lastAlong = along(net.lastYear * 12)
  const rowsAbove = form.collapseBranches ? 18 : (skillGroups.length - 1) * form.rowGap
  const nowY = Math.max(radius + form.nameSize * NAME_LEADING + 16, rowsAbove + 20, lastAlong - nowAlong + 16)
  const project = ([u, v]) => [cx - v, nowY + nowAlong - u]
  const yOf = (months) => nowY + nowAlong - along(months)

  const lines = drawnLines(net, ribbon, along, startOf, offsetOf, lineWidth, project).map(finishLine)
  const branches = buildBranches(form, cx, nowY, radius, skillGroups, ui)
  const field = new Field()
  for (const row of branches.rows) field.addBox(rowBox(row))
  for (const { points } of [...branches.rows, ...branches.decor]) field.addPolyline(points, 6)
  for (const line of lines) field.addPolyline(line.points, line.width / 2)
  const labelWidth = form.width - form.labelX - form.margin

  const nowWidth = textWidth(ui.present, form.nameSize, 'display')
  const nowBox = {
    x: Math.max(form.axisRight + 6, cx - nowWidth / 2),
    y: nowY - radius - 8 - form.nameSize * NAME_LEADING,
    w: nowWidth,
    h: form.nameSize * NAME_LEADING,
  }
  const items = []
  const stationsRaw = net.roles.map((role, index) => {
    const u = startOf(role)
    const offset = offsetOf(role)
    const [x, y] = project([u, ribbon.at(u, offset)])
    const big = role.primary === true
    const disc = big ? form.bigDisc : form.disc
    const block = stationBlock(role, form, labelWidth, big, true)
    const station = { role, index, x, y, disc, big, block, atRim: u < along(role.from) }
    items.push({
      id: role.id, desired: y - block.size * 0.6, height: block.height, station,
      anchor: [x + disc, y], width: block.width,
    })
    return station
  })
  for (const study of net.studies) {
    const yTop = yOf(study.to)
    const yBottom = yOf(study.from)
    const degree = wrapWords(study.degree, form.eduSize, 'body', labelWidth)
    const meta = studyParts(study, ui).slice(1)
    meta[0] = { ...meta[0], text: meta[0].text.replace(/^ · /, '') }
    const height = (degree.length + 1) * form.eduSize * 1.32
    const mid = (Math.max(yTop, radius) + yBottom) / 2
    items.push({
      id: study.id, desired: mid - form.eduSize * 0.7, height, study: { yTop, yBottom }, anchor: [form.eduX, mid],
      width: Math.max(...degree.map((line) => textWidth(line, form.eduSize, 'body')), partsWidth(meta, form.eduSize)),
      build: (top) => ({
        lines: [
          ...degree.map((text, index) => ({
            x: form.labelX, y: round(top + form.eduSize * (1.02 + index * 1.32)), size: form.eduSize,
            parts: [{ text, className: 'tm-edu-strong' }],
          })),
          {
            x: form.labelX, y: round(top + form.eduSize * (1.02 + degree.length * 1.32)), size: form.eduSize, parts: meta,
          },
        ],
      }),
    })
  }

  // Top to bottom, each label as near its station as the one above allows. Nothing can overlap by construction.
  items.sort((a, b) => a.desired - b.desired || a.id.localeCompare(b.id))
  const textBoxes = [{ id: 'now', ...nowBox }]
  let floor = 0
  const leaders = []
  const placed = new Map()
  for (const item of items) {
    let top = Math.max(item.desired, floor)
    const boxAt = (y) => ({ x: form.labelX, y, w: item.width, h: item.height })
    while (!field.isFree(grow(boxAt(top), 2))) top += 4
    const box = boxAt(top)
    field.addBox(box)
    textBoxes.push({ id: item.id, ...box })
    floor = top + item.height + (form.collapseBranches ? 8 : 12)
    const [ax, ay] = item.anchor
    const firstLineY = top + Math.min(item.height, form.nameSize) * 0.45
    const elbow = form.labelX - 12
    leaders.push({ id: item.id, d: toPath([[ax, ay], [Math.max(ax, elbow - Math.abs(firstLineY - ay)), ay], [elbow, firstLineY], [form.labelX - 5, firstLineY]]) })
    placed.set(item.id, { item, top, box })
  }
  const leaderFor = (id) => leaders.find((leader) => leader.id === id).d

  const stations = stationsRaw.map(({ role, index, x, y, disc, big, block, atRim }) => {
    const { top, box } = placed.get(role.id)
    return {
      id: role.id, index, style: role.style, big, atRim, x: round(x), y: round(y), r: disc,
      letter: Array.from(role.name)[0].toUpperCase(),
      name: role.name,
      period: role.period,
      lines: blockLines(block, form.labelX, top, form),
      frame: box,
      leader: leaderFor(role.id),
    }
  })
  const studies = net.studies.map((study) => {
    const { item, top } = placed.get(study.id)
    return {
      id: study.id,
      d: toPath([[form.eduX, item.study.yTop], [form.eduX, item.study.yBottom]]),
      lines: item.build(top).lines,
      leader: leaderFor(study.id),
    }
  })

  const firstTickY = yOf(net.firstYear * 12)
  const lastTickY = yOf(net.lastYear * 12)
  const ticks = []
  for (let year = net.firstYear; year <= net.lastYear; year += 1) {
    const y = yOf(year * 12)
    ticks.push({
      year,
      tick: toPath([[form.axisRight - 4, y], [form.axisRight + 4, y]]),
      x: form.axisRight - 8,
      y: round(y + form.yearSize * 0.36),
      anchor: 'end',
    })
  }
  const bottom = Math.max(firstTickY, ...textBoxes.map((box) => box.y + box.h))

  return {
    orientation: 'vertical',
    width: form.width,
    height: Math.ceil(bottom + 14),
    size: { year: form.yearSize, row: form.rowSize },
    axis: { d: toPath([[form.axisRight, lastTickY], [form.axisRight, firstTickY]]), ticks },
    lines,
    stations,
    studies,
    portrait: { x: round(cx), y: round(nowY), r: round(radius) },
    now: {
      lines: [{
        x: round(nowBox.x), y: round(nowBox.y + form.nameSize * 0.84), size: form.nameSize,
        parts: [{ text: ui.present, className: 'tm-name' }],
      }],
      leader: null,
    },
    branches: finishBranches(branches),
    textBoxes,
    segments: field.segments,
    along: { axis: 'y', origin: firstTickY, pxYear: -pxYear, firstYear: net.firstYear },
  }
}

/**
 * The whole map for one form.
 * @param {{ positions: import('@/lib/types').Position[], education: import('@/lib/types').EducationItem[], skillGroups: import('@/lib/types').SkillGroup[], dataDate: string, ui: import('@/lib/types').Ui }} input
 * @param {keyof typeof FORMS} formName
 */
export function layoutTransitMap(input, formName) {
  const form = FORMS[formName]
  if (!form) throw new Error(`unknown map form: ${formName}`)
  if (input.positions.length === 0) throw new Error('the map needs at least one position')
  if (form.orientation === 'vertical') return layoutVertical(input, form, buildNetwork(input))
  // A long name on the accent line can need more room above the ribbon: make it before sending the label to the bottom.
  let map
  for (const extraHeadroom of [0, 50, 100, 160]) {
    map = layoutHorizontal(input, form, buildNetwork(input), extraHeadroom)
    if (!map.usedFallback) break
  }
  return map
}

/**
 * The same lanes and styles for the Experience section, where the list runs newest first. A role's line starts at the
 * first entry it was already active for and ends on its own entry, which is where its stop sits.
 * @param {import('@/lib/types').Position[]} positions
 * @param {string} dataDate
 * @param {import('@/lib/types').Ui} ui
 */
export function layoutRails(positions, dataDate, ui) {
  const now = toMonthsAfter(dataDate)
  const { roles, laneCount } = buildRoles(positions, now, ui)
  const ordered = [...roles].sort((a, b) => b.from - a.from)
  const rows = ordered.map((role, entry) => ({
    id: role.id,
    letter: Array.from(role.name)[0].toUpperCase(),
    lane: role.lane,
    style: role.style,
    tracks: ordered.flatMap((other, index) => {
      if (index < entry || other.to <= role.from) return []
      const opens = entry === 0 || other.to <= ordered[entry - 1].from
      return [{ id: other.id, lane: other.lane, style: other.style, opens, ends: index === entry }]
    }),
  }))
  return { laneCount, rows }
}
