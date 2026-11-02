import StopHead from '@/components/StopHead'
import { formatDate } from '@/lib/format'

function Row({ item, ui }) {
  return (
    <li data-certification={item.id} className={`cert ${item.featured ? 'cert-top' : ''}`}>
      <p className="cert-title">{item.title}</p>
      <p className="cert-issuer">{item.issuer}</p>
      {/* INTENTIONAL: the cells stay when the value is null, so the columns of the row hold. */}
      <p className="cert-date">{item.date ? formatDate(item.date, ui.months) : null}</p>
      <p className="cert-link">
        {item.credentialUrl ? (
          <a href={item.credentialUrl} aria-label={`${ui.viewCredential}: ${item.title}`}>
            {ui.viewCredential}
          </a>
        ) : null}
      </p>
    </li>
  )
}

export default function Certifications({ items, ui }) {
  const featured = items.filter((item) => item.featured)
  const rest = items.filter((item) => !item.featured)
  return (
    <section aria-labelledby="certifications" className="wrap section">
      <StopHead id="certifications">{ui.sections.certifications}</StopHead>
      <ul className="certs">
        {featured.map((item) => (
          <Row key={item.id} item={item} ui={ui} />
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="more">
          <summary>
            <span className="more-closed">
              {ui.showMore} ({rest.length})
            </span>
            <span className="more-opened">{ui.showLess}</span>
          </summary>
          <ul className="certs">
            {rest.map((item) => (
              <Row key={item.id} item={item} ui={ui} />
            ))}
          </ul>
        </details>
      ) : null}
    </section>
  )
}
