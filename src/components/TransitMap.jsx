import { useMemo } from 'react'
import { FORM_NAMES, layoutTransitMap } from '@/lib/transitMap'

function Label({ lines, hidden }) {
  return lines.map((line, index) => (
    <text key={index} x={line.x} y={line.y} fontSize={line.size} className="tm-halo" aria-hidden={hidden ? 'true' : undefined}>
      {line.parts.map((part) => (
        <tspan key={part.text} className={part.className}>
          {part.text}
        </tspan>
      ))}
    </text>
  ))
}

/** Outlined styles are layered strokes; only the outer ones can draw in, because a dash pattern cannot animate its own. */
function Line({ line }) {
  const { d, style, width, index } = line
  return (
    <g className={`tm-ln tm-ln-${index}`}>
      <path d={d} pathLength="1" strokeWidth={width} className={`tm-draw ${style === 'accent' ? 'tm-stroke-accent' : 'tm-stroke-ink'}`} />
      {style === 'hollow' || style === 'dashed' ? (
        <path d={d} pathLength="1" strokeWidth={width * 0.5} className="tm-draw tm-stroke-paper" />
      ) : null}
      {style === 'dashed' ? (
        <path d={d} strokeWidth={width * 0.5} strokeDasharray={`${width * 0.46} ${width * 0.38}`} className="tm-fade tm-stroke-ink tm-butt" />
      ) : null}
    </g>
  )
}

function Station({ station, stationClass }) {
  const { frame, id, index, style, x, y, r, letter, lines } = station
  return (
    <a className={`tm-st tm-st-${index} ${stationClass}`} href={`#position-${id}`}>
      <rect className="tm-frame" x={frame.x - 5} y={frame.y - 4} width={frame.w + 10} height={frame.h + 8} rx="4" />
      <Label lines={lines} />
      <g className="tm-disc" aria-hidden="true">
        <circle cx={x} cy={y} r={r} strokeWidth={r * 0.24} className={`tm-disc-${style}`} />
        <text x={x} y={y} dy=".36em" fontSize={r * 1.02} textAnchor="middle" className={`tm-letter tm-letter-${style}`}>
          {letter}
        </text>
      </g>
    </a>
  )
}

function Branch({ row, form }) {
  const [dotX, dotY] = row.dot
  const dot = form === 'wide' ? 9 : 8
  return (
    <a className="tm-br" href={row.href}>
      <rect className="tm-frame" x={row.frame.x} y={row.frame.y} width={row.frame.w} height={row.frame.h} rx="4" />
      <circle className="tm-dot" cx={dotX} cy={dotY} r={dot} />
      <text x={row.label.x} y={row.label.y} dy=".34em" fontSize={row.size} className="tm-row">
        {row.text}
      </text>
    </a>
  )
}

function Form({ name, layout, photo, label }) {
  const { width, height, axis, lines, stations, studies, portrait, now, branches, size } = layout
  const clip = `tm-face-${name}`
  const inner = portrait.r - 7
  return (
    <svg className={`tm tm-${name}`} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={label}>
      <defs>
        <clipPath id={clip}>
          <circle cx={portrait.x} cy={portrait.y} r={inner} />
        </clipPath>
      </defs>

      <g aria-hidden="true">
        <path d={axis.d} className="tm-axis" />
        {axis.ticks.map((tick) => (
          <g key={tick.year}>
            <path d={tick.tick} className="tm-axis" />
            <text x={tick.x} y={tick.y} fontSize={size.year} textAnchor={tick.anchor} className="tm-year">
              {tick.year}
            </text>
          </g>
        ))}
        {stations.map((station) => (station.leader ? <path key={station.id} d={station.leader} className="tm-leader" /> : null))}
        {studies.map((study) => (
          <g key={study.id}>
            {study.leader ? <path d={study.leader} className="tm-leader" /> : null}
            <path d={study.d} className="tm-study" />
          </g>
        ))}
        {now.leader ? <path d={now.leader} className="tm-leader" /> : null}
        {branches.decor.map((item) => (
          <path key={item.d} d={item.d} className={`tm-fade tm-branch ${item.accent ? 'tm-stroke-accent' : 'tm-stroke-ink'}`} />
        ))}
        {branches.rows.map((row) => (
          <path
            key={row.id}
            d={row.d}
            pathLength="1"
            className={`tm-draw tm-branch ${row.main ? 'tm-branch-main' : ''} ${row.accent ? 'tm-stroke-accent' : 'tm-stroke-ink'}`}
          />
        ))}
        {lines.map((line) => (
          <Line key={line.id} line={line} />
        ))}
      </g>

      {studies.map((study) => (
        <g key={study.id}>
          <Label lines={study.lines} />
        </g>
      ))}
      {/* A bare "Present" means nothing read aloud; each current role already says it in its own link. */}
      <Label lines={now.lines} hidden />
      <circle cx={portrait.x} cy={portrait.y} r={portrait.r} className="tm-portrait" aria-hidden="true" />
      <image
        href={photo.webp}
        x={portrait.x - inner}
        y={portrait.y - inner}
        width={inner * 2}
        height={inner * 2}
        clipPath={`url(#${clip})`}
        role="img"
        aria-label={photo.alt}
      />
      {stations.map((station) => (
        <Station key={station.id} station={station} stationClass={station.big ? 'tm-st-big' : ''} />
      ))}
      {branches.rows.map((row) => (
        <Branch key={row.id} row={row} form={name} />
      ))}
    </svg>
  )
}

/**
 * INTENTIONAL: every form is in the HTML and CSS shows one, so the map is drawn with no JavaScript and hydration never
 * has to know the viewport. A hidden form is display:none, so a screen reader meets only the one on screen. A station's
 * link is named by its visible text, not an aria-label, so what is heard and what a voice user reads out are the same.
 */
export default function TransitMap({ positions, education, skillGroups, dataDate, photo, ui }) {
  const forms = useMemo(
    () => FORM_NAMES.map((name) => ({ name, layout: layoutTransitMap({ positions, education, skillGroups, dataDate, ui }, name) })),
    [positions, education, skillGroups, dataDate, ui],
  )
  return forms.map(({ name, layout }) => <Form key={name} name={name} layout={layout} photo={photo} label={ui.mapLabel} />)
}
