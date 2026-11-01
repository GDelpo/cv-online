import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

// Reads the real stylesheet, so a token change cannot drift away from this check. WCAG 2 relative luminance on sRGB.
const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

function tokens(selector) {
  const start = css.indexOf(`${selector} {`)
  const block = css.slice(start, css.indexOf('}', start))
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map(([, name, value]) => [name, value]))
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((index) => {
    const channel = parseInt(hex.slice(index, index + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const TEXT = [
  ['ink', 'paper'],
  ['muted', 'paper'],
  ['accent', 'paper'],
  ['on-accent', 'accent'],
  ['on-band-accent', 'band-accent'],
  ['on-band-ink', 'band-ink'],
  ['on-band-ink-soft', 'band-ink'],
  ['on-bar', 'bar'],
  ['paper', 'ink'],
]
const LINE_ART = [
  ['accent-line', 'paper'],
  ['band-line', 'band-ink'],
  ['on-band-ink-soft', 'band-ink'],
  ['band-line', 'bar'],
]

describe.each([
  ['light', tokens(':root')],
  ['dark', tokens('.dark')],
])('%s theme', (_name, theme) => {
  it.each(TEXT)('%s on %s is at least 4.5:1', (foreground, background) => {
    expect(ratio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(4.5)
  })

  it.each(LINE_ART)('%s on %s is at least 3:1', (foreground, background) => {
    expect(ratio(theme[foreground], theme[background])).toBeGreaterThanOrEqual(3)
  })
})

describe('the brand pair', () => {
  it('vermilion on cool white is computed, not assumed', () => {
    expect(ratio('#C8401E', '#F4F6F3')).toBeCloseTo(4.59, 2)
  })
})
