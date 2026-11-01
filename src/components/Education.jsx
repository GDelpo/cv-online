import { formatPeriod } from '@/lib/format'

export default function Education({ items, ui }) {
  return (
    <section aria-labelledby="education" className="ledger-section">
      <h2 id="education" className="ledger-title">
        {ui.sections.education}
      </h2>
      <ul className="ledger-body">
        {items.map((item) => (
          <li
            key={item.id}
            data-education={item.id}
            className="ledger-row border-t border-rule py-2 first:border-t-0 first:pt-0"
          >
            <p className="ledger-meta lg:pt-0.5">{formatPeriod(item.start, item.end, ui.months)}</p>
            <div>
              <p className="font-semibold">{item.degree}</p>
              <p>
                {item.school}
                {item.inProgress ? <span className="text-muted"> · {ui.inProgress}</span> : null}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
