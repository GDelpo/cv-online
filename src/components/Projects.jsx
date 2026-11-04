import StopHead from '@/components/StopHead'

export default function Projects({ items, github, ui }) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="projects" className="wrap section section-last">
      <StopHead id="projects">{ui.sections.projects}</StopHead>
      <ul className="projects">
        {items.map((item) => (
          <li key={item.id} data-project={item.id} className="project">
            <h3 className="project-name">{item.name}</h3>
            <p>{item.description}</p>
            <a className="project-link" href={item.url} aria-label={`${ui.viewRepository}: ${item.name}`}>
              {ui.viewRepository}
            </a>
          </li>
        ))}
      </ul>
      {/* INTENTIONAL: the list is a reviewed selection, so the rest of the repos stay one click away. */}
      <a className="projects-all" href={`${github}?tab=repositories`}>
        {ui.allRepositories}
      </a>
    </section>
  )
}
