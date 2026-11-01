import StopHead from '@/components/StopHead'
import { formatPeriod } from '@/lib/format'

export default function Education({ items, ui }) {
  return (
    <section aria-labelledby="education" className="wrap section">
      <StopHead id="education">{ui.sections.education}</StopHead>
      <ul className="eduline">
        {items.map((item) => {
          const period = formatPeriod(item.start, item.end, ui.months)
          return (
            <li key={item.id} data-education={item.id} className={item.inProgress ? 'edu-now' : undefined}>
              <p className="edu-degree">{item.degree}</p>
              <p className="edu-school">{item.school}</p>
              <p className="edu-period">
                {period}
                {item.inProgress ? (
                  <span className="edu-tag">
                    {period ? ' · ' : ''}
                    {ui.inProgress}
                  </span>
                ) : null}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
