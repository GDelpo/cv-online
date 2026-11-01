const DATE = /^(\d{4})(?:-(\d{2}))?$/

function parse(value) {
  const match = DATE.exec(value ?? '')
  if (!match) throw new Error(`invalid date: ${JSON.stringify(value)}`)
  const month = match[2] === undefined ? null : Number(match[2])
  if (month !== null && (month < 1 || month > 12)) throw new Error(`invalid month: ${JSON.stringify(value)}`)
  return { year: Number(match[1]), month }
}

/** "2020-12" reads "dic 2020", "2025" reads "2025". Rendered from ui.months, never Intl, so SSR and browser agree. */
export function formatDate(value, months) {
  const { year, month } = parse(value)
  if (month === null) return String(year)
  const name = months?.[month - 1]
  if (!name) throw new Error(`no month name for ${value}`)
  return `${name} ${year}`
}

/** A period's end: the closing date, or ui.present for a current one. A past period with no end is a data error. */
export function formatEnd(end, current, ui) {
  if (end) return formatDate(end, ui.months)
  if (current) return ui.present
  throw new Error('period has no end and is not current')
}

/**
 * A period where either side may be missing, as in education: "2019 – 2022", "2019", or "" with no dates at all.
 * INTENTIONAL: LinkedIn lets a degree have no dates, and a missing value renders nothing. A present but malformed date
 * still throws through formatDate.
 */
export function formatPeriod(start, end, months) {
  return [start, end]
    .filter(Boolean)
    .map((date) => formatDate(date, months))
    .join(' – ')
}

/** Months since year 0, to place a date on the rail. A year alone counts as its January. */
export function toMonths(value) {
  const { year, month } = parse(value)
  return year * 12 + (month ?? 1) - 1
}

/** The moment a period ending on this date is over: an end month or year is inclusive, so the next month's start. */
export function toMonthsAfter(value) {
  const { year, month } = parse(value)
  return year * 12 + (month ?? 12)
}
