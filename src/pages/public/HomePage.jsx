import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import SkillsShowcase from '../../components/public/SkillsShowcase';
import { usePortfolio } from '../../hooks/usePortfolio';

const visibleEntries = (items = []) => items.filter((item) => item.published).sort((a, b) => a.sortOrder - b.sortOrder);

function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {action}
    </div>
  );
}

function PublicNav({ portfolio }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const links = portfolio.navigation.items;
  useEffect(() => {
    const sections = links.map((item) => document.querySelector(item.href)).filter(Boolean);
    if (!sections.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (current) setActive(`#${current.target.id}`);
    }, { rootMargin: '-15% 0px -70% 0px' });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [links]);
  return (
    <header className="public-nav">
      <div className="nav-inner">
        <Link to="/" className="brand"><span className="brand-mark">{portfolio.navigation.logo}</span><span>{portfolio.profile.fullName}</span></Link>
        <button className="icon-button mobile-menu-button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
        <nav className={open ? 'nav-links is-open' : 'nav-links'}>
          {links.map(({ label, href }) => <a key={href} className={active === href ? 'active' : ''} href={`/${href}`} onClick={() => setOpen(false)}>{label}</a>)}
          <a className="nav-cv" href={portfolio.profile.cvUrl || portfolio.settings.defaultCv} target="_blank" rel="noreferrer">Download CV <ArrowUpRight size={14} /></a>
        </nav>
      </div>
    </header>
  );
}

export default function HomePage() {
  const { portfolio, loading } = usePortfolio();
  if (loading || !portfolio) return <div className="loading-screen">Loading portfolio…</div>;
  const { profile, about, experience, skills, projects, education, certifications, interests, contact, footer, settings } = portfolio;
  const sections = settings.sectionVisibility;
  const publishedProjects = visibleEntries(projects);
  const groupedSkills = visibleEntries(skills).reduce((groups, skill) => {
    (groups[skill.category || 'Other'] ||= []).push(skill);
    return groups;
  }, {});
  const socials = contact.socialLinks || profile.socialLinks || {};

  return (
    <>
      <PublicNav portfolio={portfolio} />
      <main>
        <section className="hero-section page-width">
          <div className="hero-copy">
            <p className="eyebrow">{profile.tagline}</p>
            <h1>Hi, I’m <span>{profile.firstName || profile.fullName.split(' ')[0]}.</span><br />{profile.professionalTitle}</h1>
            <p className="hero-intro">{profile.shortIntroduction}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#projects">Explore my work <ArrowDownRight size={16} /></a>
              <a className="button button-subtle" href={`mailto:${contact.email || profile.email}`}>Get in touch <ArrowUpRight size={16} /></a>
            </div>
            <div className="hero-socials">
              {socials.github && <a href={socials.github} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a>}
              {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17} /> LinkedIn</a>}
              <span>{profile.location}</span>
            </div>
          </div>
          <div className="hero-image-wrap"><ImageWithFallback src={profile.profileImage || settings.defaultProfileImage} alt={profile.fullName} className="hero-image" /><div className="hero-image-caption"><span className="availability-dot" /> Based in {profile.location}</div></div>
        </section>

        {sections.about && <section id="about" className="section page-width">
          <SectionHeading eyebrow="A bit about me" title={about.title || 'About me'} />
          <div className="about-grid"><p className="about-lead">{about.description}</p><p className="body-copy">{profile.biography}</p></div>
          <div className="stats-row">{about.statistics.map((stat) => <div className="stat-item" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
        </section>}

        {sections.experience && <section id="experience" className="section section-muted">
          <div className="page-width">
            <SectionHeading eyebrow="The path so far" title="Experience" />
            <div className="timeline">{visibleEntries(experience).map((job) => <article className="timeline-item" key={job.id}>
              <div className="timeline-mark" />
              <div className="timeline-content">
                <div className="entry-heading"><div className="experience-title">{job.companyLogo && <ImageWithFallback src={job.companyLogo} alt="" className="company-logo" />}<div><h3>{job.title}</h3><p className="entry-company">{job.company} <span>·</span> {job.location} · {job.employmentType}</p></div></div><span className="entry-date">{job.startDate} — {job.current ? 'Present' : job.endDate}</span></div>
                <p className="body-copy">{job.responsibilities?.join(' · ')}</p>
                {job.achievements?.length > 0 && <p className="achievement">{job.achievements.join(' ')}</p>}
                <div className="tag-row">{job.technologies?.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div>
              </div>
            </article>)}</div>
          </div>
        </section>}

        {sections.skills && <section id="skills" className="section page-width">
          <SectionHeading eyebrow="Tools of the trade" title="Skills & expertise" />
          <SkillsShowcase groups={groupedSkills} />
        </section>}

        {sections.projects && <section id="projects" className="section section-muted">
          <div className="page-width">
            <SectionHeading eyebrow="Selected work" title="Projects" action={<Link className="text-link" to="/projects">All projects <ArrowRight size={15} /></Link>} />
            <div className="project-grid">{[...publishedProjects].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} />)}</div>
          </div>
        </section>}

        {sections.education && <section id="education" className="section page-width">
          <SectionHeading eyebrow="Learning" title="Education" />
          <div className="simple-grid">{visibleEntries(education).map((item) => <article className="simple-card" key={item.id}><p className="eyebrow">{item.startDate} — {item.endDate}</p><h3>{item.qualification} in {item.fieldOfStudy}</h3><p>{item.institution}</p><span className="muted-text">{item.location}</span><p className="education-description">{item.description}</p></article>)}</div>
        </section>}

        {sections.certifications && <section id="certifications" className="section section-muted">
          <div className="page-width">
            <SectionHeading eyebrow="Continuous growth" title="Certifications" />
            <div className="simple-grid">{visibleEntries(certifications).map((item) => <article className="cert-card" key={item.id}>{item.image && <ImageWithFallback src={item.image} alt="" className="cert-image" />}<div><p className="eyebrow">{item.issuer} · {item.issueDate}</p><h3>{item.name}</h3><p className="muted-text">Credential {item.credentialId}{item.expirationDate ? ` · Expires ${item.expirationDate}` : ''}</p></div>{item.credentialUrl && <a className="icon-button" href={item.credentialUrl} target="_blank" rel="noreferrer" aria-label={`View ${item.name}`}><ArrowUpRight size={17} /></a>}</article>)}</div>
          </div>
        </section>}

        {sections.interests && <section id="interests" className="section page-width">
          <SectionHeading eyebrow="Away from the keyboard" title="Outside of work" />
          <div className="interest-grid">{visibleEntries(interests).map((item) => <article className="interest-card" key={item.id}><ImageWithFallback src={item.image} alt="" /><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div>
        </section>}

        {sections.contact && <section id="contact" className="contact-section">
          <div className="page-width contact-inner"><div><p className="eyebrow">Have a good one in mind?</p><h2>Let’s make it happen.</h2><p>{footer.description}</p></div><a className="button button-primary" href={`mailto:${contact.email || profile.email}`}><Mail size={16} /> Say hello <ArrowUpRight size={16} /></a></div>
        </section>}
      </main>
      <footer className="site-footer page-width"><div><Link to="/" className="brand"><span className="brand-mark">{portfolio.navigation.logo}</span><span>{profile.fullName}</span></Link><p>{profile.professionalTitle}</p></div><div className="footer-right"><div className="footer-links">{portfolio.navigation.items.map((item) => <a key={item.href} href={`/${item.href}`}>{item.label}</a>)}<Link to="/admin/login">Admin</Link></div><span>© {new Date().getFullYear()} {profile.fullName}. {footer.copyrightText}</span></div></footer>
    </>
  );
}

function ProjectCard({ project }) {
  return <article className="project-card">
    <Link to={`/projects/${project.slug}`} className="project-image-link"><ImageWithFallback src={project.image} alt={project.title} className="project-image" />{project.featured && <span className="featured-label">Featured</span>}</Link>
    <div className="project-card-body"><p className="eyebrow">{project.category}</p><h3><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><div className="tag-row">{project.technologies?.map((item) => <span className="tag" key={item}>{item}</span>)}</div><div className="project-links">{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noreferrer">Source <Github size={14} /></a>}{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noreferrer">Live demo <ArrowUpRight size={14} /></a>}</div></div>
  </article>;
}
