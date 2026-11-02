import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export default function ProjectsPage() {
  const { portfolio } = usePortfolio();
  const [filter, setFilter] = useState('All');
  if (!portfolio) return null;
  const projects = portfolio.projects.filter((project) => project.published).sort((a, b) => a.sortOrder - b.sortOrder);
  const categories = ['All', ...new Set(projects.map((project) => project.category).filter(Boolean))];
  const filtered = filter === 'All' ? projects : projects.filter((project) => project.category === filter);
  return <div className="projects-page">
    <div className="projects-page-top"><Link to="/" className="brand"><span className="brand-mark">{portfolio.navigation.logo}</span><span>{portfolio.profile.fullName}</span></Link><Link to="/#projects" className="text-link">Back to portfolio</Link></div>
    <main className="page-width projects-listing"><p className="eyebrow">Selected work</p><h1>Projects</h1><p className="body-copy">A collection of products and experiments built with care.</p>
      <div className="filter-chips">{categories.map((category) => <button key={category} className={filter === category ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(category)}>{category}</button>)}</div>
      <div className="project-grid">{filtered.map((project) => <article key={project.id} className="project-card"><Link to={`/projects/${project.slug}`} className="project-image-link"><ImageWithFallback src={project.image} alt={project.title} className="project-image" /></Link><div className="project-card-body"><p className="eyebrow">{project.category}</p><h3><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><div className="tag-row">{project.technologies?.map((technology) => <span key={technology} className="tag">{technology}</span>)}</div></div></article>)}</div>
      {!filtered.length && <p className="empty-note">No projects in this category yet.</p>}
    </main>
    <footer className="site-footer page-width"><span>© {new Date().getFullYear()} {portfolio.profile.fullName}</span></footer>
  </div>;
}

export function ProjectDetailsPage() {
  const { portfolio } = usePortfolio();
  const { slug } = useParams();
  const project = portfolio?.projects.find((item) => item.slug === slug && item.published);
  if (!portfolio) return null;
  if (!project) return <div className="not-found"><h1>Project not found</h1><Link className="text-link" to="/projects">Browse projects</Link></div>;
  return <main className="project-detail page-width"><Link to="/projects" className="text-link">← All projects</Link><p className="eyebrow">{project.category}</p><h1>{project.title}</h1><p className="detail-description">{project.description}</p><ImageWithFallback src={project.image} alt={project.title} className="detail-image" /><div className="detail-meta"><div><h2>Built with</h2><div className="tag-row">{project.technologies?.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div></div><div className="detail-actions">{project.githubUrl && <a className="button button-subtle" href={project.githubUrl} target="_blank" rel="noreferrer">View source ↗</a>}{project.liveUrl && <a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">Live project ↗</a>}</div></div></main>;
}

export function NotFoundPage() {
  return <div className="not-found"><p className="eyebrow">404</p><h1>This page wandered off.</h1><Link className="button button-primary" to="/">Return home</Link></div>;
}
