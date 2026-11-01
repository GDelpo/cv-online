import { toMonths } from '@/lib/format'

const FIRST_YEAR = 2015
const YEAR_STEP = 3
const ROW = 34
const TOP = 4

/**
 * One bar per position, from 2015 to the data date.
 * INTENTIONAL: percent coordinates and no viewBox, so the bars fit any width while the 12px labels stay 12px.
 * A viewBox would scale the text down to unreadable at 390px.
 */
export default function TenureRail({ positions, dataDate }) {
  const from = toMonths(String(FIRST_YEAR))
  const to = toMonths(dataDate)
  const span = to - from
  const percent = (months) => `${((months / span) * 100).toFixed(2)}%`
  const axisY = TOP + positions.length * ROW + 8

  const ticks = []
  for (let year = FIRST_YEAR; toMonths(String(year)) < to; year += YEAR_STEP) ticks.push(year)

  return (
    <svg aria-hidden="true" focusable="false" width="100%" height={axisY + 20} className="mb-8 block print:hidden">
      {ticks.map((year) => {
        const x = percent(toMonths(String(year)) - from)
        return (
          <g key={year}>
            <line x1={x} x2={x} y1="0" y2={axisY} className="stroke-rule" />
            <text x={x} y={axisY + 16} dx="4" className="fill-muted text-xs tabular-nums">
              {year}
            </text>
          </g>
        )
      })}
      <line x1="0" x2="100%" y1={axisY} y2={axisY} className="stroke-rule" />
      {positions.map((position, index) => {
        const start = toMonths(position.start) - from
        if (start < 0) throw new Error(`${position.id} starts before the rail's first year, ${FIRST_YEAR}`)
        const end = (position.end ? toMonths(position.end) : to) - from
        const y = TOP + index * ROW
        return (
          <g key={position.id}>
            {/* INTENTIONAL: the stroke in the page color is a halo, so a year line never strikes through a label. */}
            <text
              x={percent(start)}
              y={y + 12}
              dx="4"
              className="fill-text stroke-bg text-xs [paint-order:stroke] [stroke-width:4px]"
            >
              {position.company ?? position.engagement}
            </text>
            <rect
              x={percent(start)}
              y={y + 18}
              width={percent(end - start)}
              height="6"
              className={position.current ? 'fill-accent' : 'fill-muted'}
            />
          </g>
        )
      })}
    </svg>
  )
}
