import StopHead from '@/components/StopHead'

export default function Summary({ person, ui }) {
  const [lead, ...rest] = person.summary
  return (
    <section aria-labelledby="summary" className="band-accent">
      <div className="wrap summary-grid">
        <StopHead id="summary">{ui.sections.summary}</StopHead>
        <div>
          <p className="summary-lead">{lead}</p>
          {rest.map((paragraph) => (
            <p key={paragraph} className="summary-rest">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
