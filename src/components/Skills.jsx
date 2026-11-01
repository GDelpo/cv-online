import StopHead from '@/components/StopHead'

export default function Skills({ groups, ui }) {
  return (
    <section aria-labelledby="skills" className="band-ink">
      <div className="wrap section section-last">
        <StopHead id="skills">{ui.sections.skills}</StopHead>
        <dl className="tree">
          {groups.map((group, index) => (
            <div key={group.id} id={`skill-${group.id}`} className={`branch ${index === 0 ? 'branch-main' : ''}`}>
              <dt>{group.label}</dt>
              <dd>
                <ul className="stops">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
