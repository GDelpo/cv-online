import StopHead from '@/components/StopHead'
import { formatDate, formatEnd } from '@/lib/format'
import { employerOf, layoutRails } from '@/lib/transitMap'

function Rail({ row }) {
  return (
    <div className="rail" aria-hidden="true">
      {row.tracks.map((track) => (
        <span
          key={track.id}
          className={`rail-t rail-t-${track.style} ${track.opens ? 'rail-open' : ''}`}
          style={{ '--lane': track.lane }}
        >
          {track.ends ? <span className="rail-end" /> : null}
        </span>
      ))}
      <span className={`rail-stop rail-stop-${row.style}`} style={{ '--lane': row.lane }}>
        {row.letter}
      </span>
    </div>
  )
}

export default function Experience({ positions, dataDate, ui }) {
  const rails = layoutRails(positions, dataDate, ui)
  return (
    <section aria-labelledby="experience" className="wrap section">
      <StopHead id="experience">{ui.sections.experience}</StopHead>
      <div className="jobs" style={{ '--lanes': rails.laneCount }}>
        {positions.map((position) => {
          const row = rails.rows.find((item) => item.id === position.id)
          const employer = employerOf(position)
          return (
            <article key={position.id} id={`position-${position.id}`} data-position={position.id} className="job">
              <Rail row={row} />
              <div className="job-body">
                <p className="job-when">
                  {formatDate(position.start, ui.months)} –{' '}
                  <span className={position.current ? 'job-now' : undefined}>{formatEnd(position.end, position.current, ui)}</span>
                </p>
                <h3 className="job-name">{employer}</h3>
                <p className="job-role">
                  {position.title}
                  {position.location ? <span className="job-place"> · {position.location}</span> : null}
                </p>
                <ul className="job-list">
                  {position.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {position.moreBullets.length > 0 ? (
                  <details className="more">
                    <summary>
                      {ui.showMore}
                      {/* Every role has this control; the hidden text tells them apart for a screen reader. */}
                      <span className="sr-only">{`: ${employer}`}</span>
                    </summary>
                    <ul className="job-list">
                      {position.moreBullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
