export default function Languages({ items, ui }) {
  return (
    <section aria-labelledby="languages" className="ledger-section">
      <h2 id="languages" className="ledger-title">
        {ui.sections.languages}
      </h2>
      <ul className="ledger-body">
        {items.map((item) => (
          <li key={item.name} className="ledger-row border-t border-rule py-2 first:border-t-0 first:pt-0">
            <p className="ledger-meta lg:pt-0.5">{item.name}</p>
            {item.level ? <p>{item.level}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
