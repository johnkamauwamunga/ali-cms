import { useEffect, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, ChevronRight, FolderKanban, GraduationCap, LayoutDashboard, Menu, Palette, UserRound, X, Wrench, Award, Heart, FileText, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';

const navigation = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Profile', path: '/admin/profile', icon: UserRound },
  { label: 'Experience', path: '/admin/experience', icon: BriefcaseBusiness },
  { label: 'Skills', path: '/admin/skills', icon: Wrench },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Education', path: '/admin/education', icon: GraduationCap },
  { label: 'Certifications', path: '/admin/certifications', icon: Award },
  { label: 'Interests', path: '/admin/interests', icon: Heart },
  { label: 'CV Generator', path: '/admin/cv', icon: FileText },
  { label: 'Settings', path: '/admin/settings', icon: Palette },
  { label: 'Authentication', path: '/admin/settings/authentication', icon: ShieldCheck },
];

export default function AdminLayout() {
  const { portfolio, loading } = usePortfolio();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const active = navigation.find((item) => item.path === location.pathname);
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);
  if (loading || !portfolio) return <div className="loading-screen">Loading workspace…</div>;
  return <div className="admin-shell">
    {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}
    <aside className={sidebarOpen ? 'admin-sidebar open' : 'admin-sidebar'}>
      <div className="sidebar-brand"><Link to="/" className="brand"><span className="brand-mark">{portfolio?.navigation.logo || 'P'}</span><span>Portfolio<span className="brand-light">CMS</span></span></Link><button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <p className="sidebar-label">Workspace</p>
      <nav className="sidebar-nav">{navigation.map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} end={path === '/admin'} onClick={() => setSidebarOpen(false)} className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}><Icon size={17} /><span>{label}</span>{path === location.pathname && <ChevronRight className="sidebar-chevron" size={15} />}</NavLink>)}</nav>
      <div className="sidebar-bottom"><div className="admin-user"><span className="avatar">{portfolio?.navigation.logo || 'P'}</span><span><strong>{portfolio?.profile.fullName || 'Portfolio owner'}</strong><small>Local workspace</small></span></div><p>Prototype dashboard · not secured</p></div>
    </aside>
    <div className="admin-main">
      <header className="admin-header"><button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={19} /></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14} /><strong>{active?.label || 'Dashboard'}</strong></div><div className="header-actions"><Link to="/admin/preview" className="preview-link">Preview website <ArrowUpRight size={15} /></Link><span className="avatar header-avatar">{portfolio?.navigation.logo || 'P'}</span></div></header>
      <div className="admin-content"><Outlet /></div>
    </div>
  </div>;
}
