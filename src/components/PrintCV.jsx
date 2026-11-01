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
        {line([person.location, person.email])} · <span className="print-cv-nobreak">{person.github}</span> ·{' '}
        <span className="print-cv-nobreak">{person.linkedin}</span>
      </p>

      <h2>{ui.sections.summary}</h2>
      {person.summary.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h2>{ui.sections.experience}</h2>
      {positions.map((position) => (
        <div key={position.id}>
          <h3>{position.title}</h3>
          <p>
            {line([
              position.company ?? position.engagement,
              position.location,
              `${formatDate(position.start, ui.months)} – ${formatEnd(position.end, position.current, ui)}`,
            ])}
          </p>
          <ul>
            {[...position.bullets, ...position.moreBullets].map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}

      {projects.length > 0 ? (
        <>
          <h2>{ui.sections.projects}</h2>
          <ul>
            {projects.map((item) => (
              <li key={item.id}>
                {line([item.name, item.description])} · <span className="print-cv-nobreak">{item.url}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>{ui.sections.skills}</h2>
      {skillGroups.map((group) => (
        <p key={group.id}>
          <strong>{group.label}:</strong> {group.items.join(', ')}
        </p>
      ))}

      <h2>{ui.sections.education}</h2>
      <ul>
        {education.map((item) => (
          <li key={item.id}>
            {line([
              item.degree,
              item.school,
              formatPeriod(item.start, item.end, ui.months),
              item.inProgress ? ui.inProgress : null,
            ])}
          </li>
        ))}
      </ul>

      <h2>{ui.sections.certifications}</h2>
      <ul>
        {certifications.map((item) => (
          <li key={item.id}>
            {line([item.title, item.issuer, item.date ? formatDate(item.date, ui.months) : null])}
            {item.credentialId ? (
              <>
                {' · '}
                {ui.credentialId}: <span className="print-cv-nobreak">{item.credentialId}</span>
              </>
            ) : null}
            {item.credentialUrl ? (
              <>
                {' · '}
                <span className="print-cv-nobreak">{item.credentialUrl}</span>
              </>
            ) : null}
          </li>
        ))}
      </ul>

      <h2>{ui.sections.languages}</h2>
      <ul>
        {languages.map((item) => (
          <li key={item.name}>{line([item.name, item.level])}</li>
        ))}
      </ul>
    </div>
  )
}
