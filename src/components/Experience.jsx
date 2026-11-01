import TenureRail from '@/components/TenureRail'
import { formatDate, formatEnd } from '@/lib/format'

export default function Experience({ positions, dataDate, ui }) {
  return (
    <section aria-labelledby="experience" className="ledger-section">
      <h2 id="experience" className="ledger-title">
        {ui.sections.experience}
      </h2>
      <div className="ledger-body">
        <TenureRail positions={positions} dataDate={dataDate} />
        {positions.map((position) => (
          <article
            key={position.id}
            data-position={position.id}
            className="ledger-row border-t border-rule py-5 last:pb-0"
          >
            <p className="ledger-meta mb-1 lg:mb-0 lg:pt-0.5">
              <span className="whitespace-nowrap">{formatDate(position.start, ui.months)} –</span>{' '}
              <span className="whitespace-nowrap">
                {position.current ? (
                  <span aria-hidden="true" className="mr-1.5 inline-block size-1.5 bg-accent align-[0.1em]" />
                ) : null}
                {formatEnd(position.end, position.current, ui)}
              </span>
            </p>
            <div className="min-w-0">
              <h3 className="font-semibold">{position.title}</h3>
              <p className="mb-2">
                {position.company ?? position.engagement}
                {position.location ? <span className="text-muted"> · {position.location}</span> : null}
              </p>
              <ul className="ledger-list">
                {position.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
              {position.moreBullets.length > 0 ? (
                <details className="ledger-more">
                  <summary className="ledger-control">
                    {ui.showMore}
                    {/* Every role has this control; the hidden text tells them apart for a screen reader. */}
                    <span className="sr-only">{`: ${position.company ?? position.engagement}`}</span>
                  </summary>
                  <ul className="ledger-list mt-1">
                    {position.moreBullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
