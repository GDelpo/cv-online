import { useSyncExternalStore } from 'react'
import Certifications from '@/components/Certifications'
import Education from '@/components/Education'
import ErrorBoundary from '@/components/ErrorBoundary'
import Experience from '@/components/Experience'
import Languages from '@/components/Languages'
import Masthead from '@/components/Masthead'
import PrintCV from '@/components/PrintCV'
import Skills from '@/components/Skills'
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
export default function App({ content }) {
  const { meta, person, positions, skillGroups, education, certifications, languages, ui } = content
  const hydrated = useHydrated()
  return (
    <ErrorBoundary>
      <div className={`mx-auto max-w-page px-5 pb-10 lg:px-10 ${hydrated ? 'print:hidden' : ''}`}>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-2 focus:bg-bg focus:px-2 focus:py-1"
        >
          {ui.skipLink}
        </a>
        <Masthead meta={meta} person={person} ui={ui} />
        <main id="content" tabIndex={-1} className="outline-none">
          <Experience positions={positions} dataDate={meta.dataDate} ui={ui} />
          <Skills groups={skillGroups} ui={ui} />
          <Education items={education} ui={ui} />
          <Certifications items={certifications} ui={ui} />
          <Languages items={languages} ui={ui} />
        </main>
        <footer className="mt-16">
          <div className="ledger-double" />
          <p className="ledger-meta pt-3">
            {ui.updated} <time dateTime={meta.dataDate}>{formatDate(meta.dataDate, ui.months)}</time>
          </p>
        </footer>
      </div>
      {hydrated ? <PrintCV content={content} /> : null}
    </ErrorBoundary>
  )
}
