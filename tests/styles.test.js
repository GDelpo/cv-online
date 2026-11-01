// The stylesheet carries behavior nothing else can see: which map form shows, and what motion does. jsdom is out by design
// and it has no layout anyway, so these read the CSS as text. Coarse, and fails loudly if the rules change shape.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FORM_NAMES } from '../src/lib/transitMap'

const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

function formRange(form) {
  const block = new RegExp(`@media ([^{]*) \\{[^@]*?\\.tm-${form} \\{\\s*display: block`).exec(css)
  if (!block) return null
  const px = (name) => Number(new RegExp(`${name}: ([\\d.]+)px`).exec(block[1])?.[1] ?? NaN)
  return { min: px('min-width') || 0, max: px('max-width') || Infinity }
}

describe('map forms', () => {
  it('hides every form by default', () => {
    expect(css).toMatch(/\.tm \{\n {2}display: none;/)
  })

  it('shows exactly one form at every width', () => {
    const ranges = FORM_NAMES.map(formRange)
    expect(ranges.every(Boolean), 'a form has no display rule').toBe(true)
    for (let width = 200; width <= 2600; width += 0.5) {
      expect(ranges.filter(({ min, max }) => width >= min && width <= max).length, `width ${width}`).toBe(1)
    }
  })
})

describe('motion', () => {
  it('runs animations and smooth scroll only for those who did not ask for less', () => {
    const open = css.indexOf('@media (prefers-reduced-motion: no-preference)')
    const close = css.indexOf('/* ---------- section heads')
    expect(open).toBeGreaterThan(-1)
    const guarded = css.slice(open, close)
    expect(guarded).toContain('scroll-behavior: smooth')
    expect(guarded).toContain('animation: tm-draw')
    const outside = css.slice(0, open) + css.slice(close)
    expect(outside).not.toMatch(/^\s*animation:/m)
    expect(outside).not.toContain('scroll-behavior: smooth')
  })

  it('turns every transition off under reduced motion', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\*,\s*::before,\s*::after \{\s*transition: none !important;/)
  })
})

describe('focus and print', () => {
  it('shows a focus ring on a map link, where outline is off', () => {
    expect(css).toMatch(/\.tm a:focus-visible \.tm-frame \{\s*stroke: var\(--ink\);/)
  })

  it('leaves the map and the rails out of a page printed with no JavaScript', () => {
    expect(css).toMatch(/\.tm,\s*\.rail,\s*\.skip \{\s*display: none !important;/)
  })
})

describe('no JavaScript', () => {
  it('hides the theme button, which could not work', () => {
    expect(html).toMatch(/<noscript><style>\.bar \.bar-theme \{ display: none; \}<\/style><\/noscript>/)
  })
})
