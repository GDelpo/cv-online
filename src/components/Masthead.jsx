import Toolbar from '@/components/Toolbar'

export default function Masthead({ meta, person, ui }) {
  const { photo } = person
  return (
    <>
      <header>
        <Toolbar locale={meta.locale} ui={ui} />
        <div className="ledger-double" />
        {/* Stacked below sm: a 350px line cannot hold the headline at a readable size, so it wraps to two there. */}
        <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-x-4 pt-6 lg:gap-x-10 lg:pt-8">
          <h1 className="font-display text-[40px] font-medium leading-[1.05] tracking-[-0.01em] lg:text-[56px]">
            {person.name}
          </h1>
          <picture className="col-start-2 row-start-1 sm:row-span-3">
            <source srcSet={photo.webp} type="image/webp" />
            {/* INTENTIONAL: lowercase attribute, because React 18 warns on the camelCase prop. The linters call it
                ignored, but React 18.3 does write it: dist/index.html has fetchpriority="high" on this img. */}
            <img
              src={photo.jpg}
              alt={photo.alt}
              width="112"
              height="112"
              // oxlint-disable-next-line react-doctor/no-unknown-property
              fetchpriority="high"
              className="block h-28 w-28 rounded-sm"
            />
          </picture>
          <p className="col-span-2 mt-4 text-lg leading-snug sm:col-span-1 sm:col-start-1 sm:mt-3">{person.headline}</p>
          <ul className="col-span-2 mt-4 flex flex-wrap gap-x-5 gap-y-1 sm:col-span-1 sm:col-start-1 sm:mt-3">
            <li>{person.location}</li>
            <li>
              <a className="ledger-link" href={`mailto:${person.email}`}>
                {person.email}
              </a>
            </li>
            <li>
              <a className="ledger-link" href={person.github}>
                GitHub
              </a>
            </li>
            <li>
              <a className="ledger-link" href={person.linkedin}>
                LinkedIn
              </a>
            </li>
            <li>
              <a className="ledger-link" href={ui.pdfPath}>
                {ui.downloadPdf}
              </a>
            </li>
          </ul>
        </div>
      </header>
      <section aria-labelledby="summary" className="mt-8 lg:grid lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-x-8">
        <h2 id="summary" className="sr-only">
          {ui.sections.summary}
        </h2>
        <div className="ledger-body max-w-prose space-y-3">
          {person.summary.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  )
}
