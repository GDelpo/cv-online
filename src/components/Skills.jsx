export default function Skills({ groups, ui }) {
  return (
    <section aria-labelledby="skills" className="ledger-section">
      <h2 id="skills" className="ledger-title">
        {ui.sections.skills}
      </h2>
      <dl className="ledger-body">
        {groups.map((group) => (
          <div key={group.id} className="ledger-row border-t border-rule py-2 first:border-t-0 first:pt-0">
            <dt className="ledger-meta lg:pt-0.5">{group.label}</dt>
            <dd className="max-w-prose">{group.items.join(', ')}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
