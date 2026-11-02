import SkillIcon from '../SkillIcon';

export default function SkillsShowcase({ groups }) {
  return <div className="skills-showcase">
    {Object.entries(groups).map(([category, entries], groupIndex) => <section className="skill-group" key={category}>
      <h3>{category}</h3>
      <div className="skill-orbit-grid">
        {entries.map((skill, index) => <article
          className="skill-float"
          key={skill.id}
          style={{ '--float-delay': `${(index % 5) * -0.7 - groupIndex * 0.3}s`, '--float-duration': `${5.4 + (index % 4) * 0.55}s` }}
        >
          <div className="skill-object">
            <span className="skill-object-icon"><SkillIcon skill={skill} /></span>
            <span className="skill-object-name">{skill.name}</span>
          </div>
        </article>)}
      </div>
    </section>)}
  </div>;
}
