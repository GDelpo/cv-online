import { describe, expect, it } from 'vitest'
import { formatDate, formatEnd, formatPeriod, toMonths, toMonthsAfter } from '../src/lib/format'

const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ui = { months, present: 'Actualidad' }

describe('formatDate', () => {
  it('renders a month and a year from ui.months', () => {
    expect(formatDate('2020-12', months)).toBe('dic 2020')
  })
  it('renders a year alone', () => {
    expect(formatDate('2025', months)).toBe('2025')
  })
  it.each([null, '', '2020-13', 'dic 2020'])('fails on %s', (value) => {
    expect(() => formatDate(value, months)).toThrow()
  })
})

describe('formatEnd', () => {
  it('prefers the closing date', () => {
    expect(formatEnd('2019-10', false, ui)).toBe('oct 2019')
  })
  it('reads present on a current period', () => {
    expect(formatEnd(null, true, ui)).toBe('Actualidad')
  })
  it('fails on a past period with no end', () => {
    expect(() => formatEnd(null, false, ui)).toThrow()
  })
})

describe('formatPeriod', () => {
  it('joins the two dates', () => {
    expect(formatPeriod('2019', '2022-03', months)).toBe('2019 – mar 2022')
  })
  it('shows whichever side exists, and nothing without dates', () => {
    expect(formatPeriod('2019', null, months)).toBe('2019')
    expect(formatPeriod(null, '2022', months)).toBe('2022')
    expect(formatPeriod(null, null, months)).toBe('')
  })
  it('still fails on a malformed date', () => {
    expect(() => formatPeriod('soon', null, months)).toThrow()
  })
})

describe('toMonthsAfter', () => {
  it('ends a role where the next month starts', () => {
    expect(toMonthsAfter('2020-11')).toBe(toMonths('2020-12'))
  })
  it('counts a year alone through its December', () => {
    expect(toMonthsAfter('2020')).toBe(toMonths('2021'))
  })
})

describe('toMonths', () => {
  it('orders dates and counts a year as its January', () => {
    expect(toMonths('2015-04') - toMonths('2015')).toBe(3)
  })
})
