import { formatDate } from '@/lib/format'

function Row({ item, ui }) {
  return (
    <li
      data-certification={item.id}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-t border-rule py-2 first:border-t-0 first:pt-0 lg:grid-cols-[128px_minmax(0,1fr)_auto] lg:gap-x-8"
    >
      <p className="min-w-0">
        {item.title}
        <span className="hidden text-muted lg:inline"> · </span>
        <span className="block text-muted lg:inline">{item.issuer}</span>
      </p>
      {/* INTENTIONAL: the cell stays when the date is null, so the columns of the row hold. */}
      <p className="ledger-meta text-right lg:order-first lg:pt-0.5 lg:text-left">
        {item.date ? formatDate(item.date, ui.months) : null}
      </p>
      {item.credentialUrl ? (
        <a
          className="ledger-link col-span-2 justify-self-start text-sm leading-6 lg:col-span-1 lg:justify-self-end lg:pt-0.5"
          href={item.credentialUrl}
          aria-label={`${ui.viewCredential}: ${item.title}`}
        >
          {ui.viewCredential}
        </a>
      ) : null}
    </li>
  )
}

export default function Certifications({ items, ui }) {
  const featured = items.filter((item) => item.featured)
  const rest = items.filter((item) => !item.featured)
  return (
    <section aria-labelledby="certifications" className="ledger-section">
      <h2 id="certifications" className="ledger-title">
        {ui.sections.certifications}
      </h2>
      <div className="ledger-body">
        <ul>
          {featured.map((item) => (
            <Row key={item.id} item={item} ui={ui} />
          ))}
        </ul>
        {rest.length > 0 ? (
          <details className="ledger-more">
            <summary className="ledger-control">
              {ui.showMore} ({rest.length})
            </summary>
            <ul className="mt-2">
              {rest.map((item) => (
                <Row key={item.id} item={item} ui={ui} />
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  )
}
