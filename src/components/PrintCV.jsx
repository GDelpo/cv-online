import { formatDate, formatEnd, formatPeriod } from '@/lib/format'

const line = (parts) => parts.filter(Boolean).join(' · ')

/**
 * INTENTIONAL: screen collapses content and print must not; ATS parsers need one plain column.
 * That is why this repeats the screen's data in its own tree instead of restyling it.
 */
export default function PrintCV({ content }) {
  const { person, positions, projects, skillGroups, education, certifications, languages, ui } = content
  return (
    <div className="print-cv hidden print:block">
      <h1>{person.name}</h1>
      <p>{person.headline}</p>
      <p>
        {person.location} · <a href={`mailto:${person.email}`}>{person.email}</a> ·{' '}
        <a className="print-cv-nobreak" href={person.github}>
          {person.github}
        </a>{' '}
        ·{' '}
        <a className="print-cv-nobreak" href={person.linkedin}>
          {person.linkedin}
        </a>
      </p>

      <h2>{ui.sections.summary}</h2>
      {person.summary.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h2>{ui.sections.experience}</h2>
      {/* INTENTIONAL: one page, so each position prints only its chosen summary and bullets (profile.print). */}
      {positions
        .filter((position) => position.print)
        .map((position) => (
          <div key={position.id}>
            <h3>{position.title}</h3>
            <p>
              {line([
                position.company ?? position.engagement,
                position.location,
                `${formatDate(position.start, ui.monthsFull)} – ${formatEnd(position.end, position.current, { ...ui, months: ui.monthsFull })}`,
              ])}
            </p>
            {position.print.summary ? <p>{position.print.summary}</p> : null}
            {position.print.bullets.length > 0 ? (
              <ul>
                {position.print.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}

      {projects.some((item) => item.print) ? (
        <>
          <h2>{ui.sections.projects}</h2>
          <ul>
            {projects.filter((item) => item.print).map((item) => (
              <li key={item.id}>
                {line([item.name, item.description])} · <span className="print-cv-nobreak">{item.url}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="print-cv-keep">
        <h2>{ui.sections.skills}</h2>
        {skillGroups.map((group) => (
          <p key={group.id}>
            <strong>{group.label}:</strong> {group.items.join(', ')}
          </p>
        ))}
      </div>

      <h2>{ui.sections.education}</h2>
      <ul>
        {education.map((item) => (
          <li key={item.id}>
            {line([
              item.degree,
              item.school,
              formatPeriod(item.start, item.end, ui.monthsFull),
              item.inProgress ? ui.inProgress : null,
            ])}
          </li>
        ))}
      </ul>

      <h2>{ui.sections.certifications}</h2>
      <ul>
        {certifications.filter((item) => item.print).map((item) => (
          <li key={item.id}>
            {/* INTENTIONAL: credential IDs and URLs were a third of the text and read as phone numbers; the link keeps them reachable. */}
            {item.credentialUrl ? <a href={item.credentialUrl}>{item.title}</a> : item.title}
            {' · '}
            {line([item.issuer, item.date ? formatDate(item.date, ui.monthsFull) : null])}
          </li>
        ))}
      </ul>

      <h2>{ui.sections.languages}</h2>
      <p>{languages.map((item) => line([item.name, item.level])).join(' | ')}</p>
    </div>
  )
}
