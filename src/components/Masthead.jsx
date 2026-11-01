import Toolbar from '@/components/Toolbar'
import TransitMap from '@/components/TransitMap'

export default function Masthead({ meta, person, positions, education, skillGroups, ui }) {
  const [first, ...rest] = person.name.split(' ')
  return (
    <header>
      <Toolbar locale={meta.locale} ui={ui} />
      <div className="hero">
        <div className="hero-in">
          <h1 className="hero-name">
            <span>{first}</span> <span>{rest.join(' ')}</span>
          </h1>
          <div className="intro">
            <p className="headline">
              {person.headline.split(' | ').map((segment, index) => (
                <span key={segment}>
                  {index > 0 ? <span className="headline-sep"> | </span> : null}
                  {segment}
                </span>
              ))}
            </p>
            <ul className="contact">
              <li>{person.location}</li>
              <li>
                <a href={`mailto:${person.email}`}>{person.email}</a>
              </li>
              <li>
                <a href={person.github}>GitHub</a>
              </li>
              <li>
                <a href={person.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a className="pdf" href={ui.pdfPath}>
                  {ui.downloadPdf}
                </a>
              </li>
            </ul>
          </div>
          <TransitMap
            positions={positions}
            education={education}
            skillGroups={skillGroups}
            dataDate={meta.dataDate}
            photo={person.photo}
            ui={ui}
          />
        </div>
      </div>
    </header>
  )
}
