import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ImageWithFallback } from '../../components/ImageWithFallback';
import { getProject, getProjects } from '../../services/api';

export default function ProjectsPage() {
  const { portfolio } = usePortfolio();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getProjects()
      .then((data) => {
        if (active) setProjects(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const categories = ['All', ...new Set(projects.map((project) => project.category).filter(Boolean))];
  const filtered = filter === 'All' ? projects : projects.filter((project) => project.category === filter);

  return <div className="projects-page">
    <div className="projects-page-top"><Link to="/" className="brand"><span className="brand-mark">{portfolio?.navigation.logo || 'P'}</span><span>{portfolio?.profile.fullName || 'Portfolio'}</span></Link><Link to="/#projects" className="text-link">Back to portfolio</Link></div>
    <main className="page-width projects-listing"><p className="eyebrow">Selected work</p><h1>Projects</h1><p className="body-copy">A collection of products and experiments built with care.</p>
      {projects.length > 0 && <div className="filter-chips">{categories.map((category) => <button key={category} className={filter === category ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(category)}>{category}</button>)}</div>}
      {loading && <p className="empty-note" role="status">Loading projects…</p>}
      {error && <p className="form-error" role="alert">Projects could not be loaded: {error}</p>}
      {!loading && !error && <div className="project-grid">{filtered.map((project) => <article key={project.id} className="project-card"><Link to={`/projects/${project.slug}`} className="project-image-link"><ImageWithFallback src={project.image} alt={project.title} className="project-image" /></Link><div className="project-card-body">{project.category && <p className="eyebrow">{project.category}</p>}<h3><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3><p>{project.description}</p><div className="tag-row">{project.technologies?.map((technology) => <span key={technology} className="tag">{technology}</span>)}</div></div></article>)}</div>}
      {!loading && !error && !filtered.length && <p className="empty-note">No published projects yet.</p>}
    </main>
    <footer className="site-footer page-width"><span>© {new Date().getFullYear()} {portfolio?.profile.fullName || 'Portfolio'}</span></footer>
  </div>;
}

export function ProjectDetailsPage() {
  const { portfolio } = usePortfolio();
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    setProject(null);
    setLoading(true);
    setError('');
    setNotFound(false);

    getProject(slug)
      .then((data) => {
        if (active) setProject(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message);
          setNotFound(requestError.status === 404);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug]);

  if (loading) return <main className="project-detail page-width"><p role="status">Loading project…</p></main>;
  if (error) return <div className="not-found"><h1>{notFound ? 'Project not found' : 'Project could not be loaded'}</h1>{!notFound && <p role="alert">{error}</p>}<Link className="text-link" to="/projects">Browse projects</Link></div>;
  if (!project) return <div className="not-found"><h1>Project not found</h1><Link className="text-link" to="/projects">Browse projects</Link></div>;

  return <main className="project-detail page-width"><Link to="/projects" className="text-link">← All projects</Link>{project.category && <p className="eyebrow">{project.category}</p>}<h1>{project.title}</h1><p className="detail-description">{project.description}</p>{project.image && <ImageWithFallback src={project.image} alt={project.title} className="detail-image" />}<div className="detail-meta"><div><h2>Built with</h2><div className="tag-row">{project.technologies?.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div></div><div className="detail-actions">{project.githubUrl && <a className="button button-subtle" href={project.githubUrl} target="_blank" rel="noreferrer">View source ↗</a>}{project.liveUrl && <a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">Live project ↗</a>}</div></div>{portfolio && <footer className="site-footer"><span>© {new Date().getFullYear()} {portfolio.profile.fullName}</span></footer>}</main>;
}

export function NotFoundPage() {
  return <div className="not-found"><p className="eyebrow">404</p><h1>This page wandered off.</h1><Link className="button button-primary" to="/">Return home</Link></div>;
}
