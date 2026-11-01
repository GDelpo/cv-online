import StopHead from '@/components/StopHead'

export default function Languages({ items, ui }) {
  return (
    <section aria-labelledby="languages" className="wrap section section-last">
      <StopHead id="languages">{ui.sections.languages}</StopHead>
      <ul className="langs">
        {items.map((item) => (
          <li key={item.name}>
            <span className="lang-name">{item.name}</span>
            {item.level ? <span>{item.level}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
