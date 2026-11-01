import { useSyncExternalStore } from 'react'
import Certifications from '@/components/Certifications'
import Education from '@/components/Education'
import ErrorBoundary from '@/components/ErrorBoundary'
import Experience from '@/components/Experience'
import Languages from '@/components/Languages'
import Masthead from '@/components/Masthead'
import PrintCV from '@/components/PrintCV'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Summary from '@/components/Summary'
import { formatDate } from '@/lib/format'

const subscribeToNothing = () => () => {}

/**
 * INTENTIONAL: false on the server and during hydration, true right after, so PrintCV stays out of the prerendered
 * HTML. There it would be a second h1 and a copy of every position for crawlers. Without JavaScript the screen tree
 * prints instead, which is why print:hidden depends on this too.
 */
const useHydrated = () =>
  useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )

/** @param {{ content: import('@/lib/types').Content }} props */
function Page({ content }) {
  const { meta, person, positions, projects, skillGroups, education, certifications, languages, ui } = content
  const hydrated = useHydrated()
  return (
    <>
      <div className={`screen ${hydrated ? 'print:hidden' : ''}`}>
        <a href="#content" className="skip">
          {ui.skipLink}
        </a>
        <Masthead meta={meta} person={person} positions={positions} education={education} skillGroups={skillGroups} ui={ui} />
        <main id="content" tabIndex={-1}>
          <Summary person={person} ui={ui} />
          <Experience positions={positions} dataDate={meta.dataDate} ui={ui} />
          <Projects items={projects} ui={ui} />
          <Skills groups={skillGroups} ui={ui} />
          <Education items={education} ui={ui} />
          <Certifications items={certifications} ui={ui} />
          <Languages items={languages} ui={ui} />
        </main>
        <footer className="band-ink foot">
          <div className="wrap">
            <a className="foot-mail" href={`mailto:${person.email}`}>
              {person.email}
            </a>
            <ul className="foot-links">
              <li>
                <a href={person.github}>GitHub</a>
              </li>
              <li>
                <a href={person.linkedin}>LinkedIn</a>
              </li>
              <li>
                <a href={ui.pdfPath}>{ui.downloadPdf}</a>
              </li>
              <li>{person.location}</li>
              <li>
                {ui.updated} <time dateTime={meta.dataDate}>{formatDate(meta.dataDate, ui.months)}</time>
              </li>
            </ul>
          </div>
        </footer>
      </div>
      {hydrated ? <PrintCV content={content} /> : null}
    </>
  )
}

/**
 * INTENTIONAL: a boundary only catches what renders below it, so everything that reads content lives in Page. Reading
 * it here, as the footer date used to, would turn bad content into a blank page instead of the fallback.
 * @param {{ content: import('@/lib/types').Content }} props
 */
export default function App({ content }) {
  return (
    <ErrorBoundary>
      <Page content={content} />
    </ErrorBoundary>
  )
}
