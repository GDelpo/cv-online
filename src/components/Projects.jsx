import StopHead from '@/components/StopHead'

function Card({ item, ui }) {
  return (
    <li data-project={item.id} className="project">
      <h3 className="project-name">{item.name}</h3>
      <p>{item.description}</p>
      <a className="project-link" href={item.url} aria-label={`${ui.viewRepository}: ${item.name}`}>
        {ui.viewRepository}
      </a>
    </li>
  )
}

export default function Projects({ items, github, ui }) {
  if (items.length === 0) return null
  // The GitHub pins lead; with no pins, every reviewed repo shows at once.
  const featured = items.some((item) => item.featured) ? items.filter((item) => item.featured) : items
  const rest = items.filter((item) => !featured.includes(item))
  return (
    <section aria-labelledby="projects" className="wrap section section-last">
      <StopHead id="projects">{ui.sections.projects}</StopHead>
      <ul className="projects">
        {featured.map((item) => (
          <Card key={item.id} item={item} ui={ui} />
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="more">
          <summary>
            <span className="more-closed">
              {ui.showMore} ({rest.length})
            </span>
            <span className="more-opened">{ui.showLess}</span>
          </summary>
          <ul className="projects">
            {rest.map((item) => (
              <Card key={item.id} item={item} ui={ui} />
            ))}
          </ul>
        </details>
      ) : null}
      {/* INTENTIONAL: the list is a reviewed selection, so the rest of the repos stay one click away. */}
      <a className="projects-all" href={`${github}?tab=repositories`}>
        {ui.allRepositories}
      </a>
    </section>
  )
}
