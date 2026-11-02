import { ArrowUpRight, Award, BriefcaseBusiness, FileText, FolderKanban, Plus, UserRound, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';

export default function DashboardPage() {
  const { portfolio } = usePortfolio();
  const collections = ['projects', 'experience', 'skills', 'certifications', 'education', 'interests'];
  const count = (name) => portfolio[name]?.length || 0;
  const published = collections.reduce((sum, name) => sum + portfolio[name].filter((entry) => entry.published).length, 0);
  const total = collections.reduce((sum, name) => sum + count(name), 0);
  const stats = [
    { label: 'Projects', value: count('projects'), icon: FolderKanban, path: '/admin/projects' },
    { label: 'Experience', value: count('experience'), icon: BriefcaseBusiness, path: '/admin/experience' },
    { label: 'Skills', value: count('skills'), icon: Wrench, path: '/admin/skills' },
    { label: 'Certifications', value: count('certifications'), icon: Award, path: '/admin/certifications' },
  ];
  return <div className="admin-page">
    <div className="page-title-row"><div><p className="eyebrow">Workspace overview</p><h1>Good to see you, {portfolio.profile.firstName}.</h1><p className="admin-description">Here’s what’s happening with your portfolio today.</p></div><Link className="button button-primary" to="/admin/preview"><ArrowUpRight size={16} /> Preview portfolio</Link></div>
    <div className="dashboard-stats">{stats.map(({ label, value, icon: Icon, path }) => <Link className="dashboard-stat" to={path} key={label}><span className="stat-icon"><Icon size={18} /></span><span className="stat-number">{value}</span><span className="stat-label">{label}</span><ArrowUpRight className="stat-arrow" size={15} /></Link>)}</div>
    <div className="dashboard-lower"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Your content</p><h2>Publication status</h2></div><FileText size={18} /></div><div className="publication-summary"><div><span className="publication-number">{published}</span><span>Published</span></div><div><span className="publication-number">{total - published}</span><span>Drafts</span></div><div className="publication-bar"><span style={{ width: `${total ? published / total * 100 : 0}%` }} /></div></div><p className="muted-text">Across projects, experience, skills, certifications, education, and interests.</p></section>
      <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Shortcuts</p><h2>Quick actions</h2></div><Plus size={18} /></div><div className="quick-actions"><Link to="/admin/projects"><FolderKanban size={17} /> Add a project <ArrowUpRight size={15} /></Link><Link to="/admin/experience"><BriefcaseBusiness size={17} /> Add experience <ArrowUpRight size={15} /></Link><Link to="/admin/skills"><Wrench size={17} /> Add a skill <ArrowUpRight size={15} /></Link><Link to="/admin/profile"><UserRound size={17} /> Edit profile <ArrowUpRight size={15} /></Link><Link to="/admin/cv"><FileText size={17} /> Build a CV <ArrowUpRight size={15} /></Link></div></section></div>
  </div>;
}
