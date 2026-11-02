import { useState } from 'react';
import { Download, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';

const sectionLabels = {
  about: 'About me', experience: 'Work experience', skills: 'Skills', projects: 'Projects',
  education: 'Education', certifications: 'Certifications', interests: 'Interests', contact: 'Contact',
};

export default function SettingsPage() {
  const { portfolio, updateSettings, updateSection, reset } = usePortfolio();
  const [values, setValues] = useState({ ...portfolio.settings });
  const [footer, setFooter] = useState({ ...portfolio.footer });
  const [navigation, setNavigation] = useState({ ...portfolio.navigation });
  const [navigationText, setNavigationText] = useState(() => JSON.stringify(portfolio.navigation.items, null, 2));
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    let items;
    try {
      items = JSON.parse(navigationText);
      if (!Array.isArray(items) || items.some((item) => !item.label || !item.href)) throw new Error('Expected navigation items with labels and hrefs.');
    } catch {
      setError('Navigation links must be a JSON array of objects with label and href values.');
      return;
    }
    if (!/^#[0-9a-f]{6}$/i.test(values.accentColor)) {
      setError('Accent color must be a valid 6-digit hex value.');
      return;
    }
    if (items.some((item) => !/^#[a-z0-9_-]+$/i.test(item.href))) {
      setError('Navigation links must point to an in-page section, such as #about.');
      return;
    }
    updateSettings(values);
    updateSection('footer', footer);
    updateSection('navigation', { ...navigation, items });
    setError('');
    toast.success('Settings saved.');
  };
  const exportData = () => {
    try {
      const file = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'portfolio-data.json';
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Portfolio data exported.');
    } catch (error) {
      console.error('Unable to export portfolio data.', error);
      toast.error('The portfolio data could not be exported.');
    }
  };
  const resetData = () => {
    if (!window.confirm('Reset all portfolio content to the original sample data? Your saved changes will be lost.')) return;
    reset();
    setValues({ ...portfolio.settings, theme: 'system', accentColor: '#c45d3a' });
    setNavigation({ ...portfolio.navigation, logo: 'JK' });
    setNavigationText(JSON.stringify([{ label: 'About', href: '#about' }, { label: 'Experience', href: '#experience' }, { label: 'Projects', href: '#projects' }, { label: 'Contact', href: '#contact' }], null, 2));
    setFooter({ description: 'Thoughtful software, built with care.', copyrightText: 'All rights reserved.' });
    toast.success('Sample data restored.');
  };
  return <div className="admin-page">
    <div className="page-title-row"><div><p className="eyebrow">Preferences</p><h1>Settings</h1><p className="admin-description">Configure the look and content of your public portfolio.</p></div></div>
    <form onSubmit={submit} className="settings-stack">
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Appearance</p><h2>Theme & accent</h2></div></div><div className="form-grid"><label className="form-field"><span>Color mode</span><select value={values.theme} onChange={(event) => setValues({ ...values, theme: event.target.value })}><option value="system">System preference</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label className="form-field"><span>Accent color</span><div className="color-control"><input type="color" value={values.accentColor} onChange={(event) => setValues({ ...values, accentColor: event.target.value })} /><input value={values.accentColor} onChange={(event) => setValues({ ...values, accentColor: event.target.value })} aria-label="Accent color hex value" /></div></label></div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Search & metadata</p><h2>Website details</h2></div></div><div className="form-grid"><label className="form-field full-field"><span>Website title</span><input value={values.websiteTitle} onChange={(event) => setValues({ ...values, websiteTitle: event.target.value })} /></label><label className="form-field full-field"><span>Website description</span><textarea rows="2" value={values.websiteDescription} onChange={(event) => setValues({ ...values, websiteDescription: event.target.value })} /></label><label className="form-field"><span>Default CV URL</span><input value={values.defaultCv} onChange={(event) => setValues({ ...values, defaultCv: event.target.value })} /></label><label className="form-field"><span>Default profile image URL</span><input value={values.defaultProfileImage} onChange={(event) => setValues({ ...values, defaultProfileImage: event.target.value })} /></label></div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Public website</p><h2>Visible sections</h2></div></div><div className="visibility-grid">{Object.entries(sectionLabels).map(([key, label]) => <label className="visibility-option" key={key}><span>{label}</span><input type="checkbox" checked={Boolean(values.sectionVisibility[key])} onChange={(event) => setValues({ ...values, sectionVisibility: { ...values.sectionVisibility, [key]: event.target.checked } })} /></label>)}</div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Navigation</p><h2>Logo & links</h2></div></div><div className="form-grid"><label className="form-field"><span>Logo initials</span><input value={navigation.logo} onChange={(event) => setNavigation({ ...navigation, logo: event.target.value })} /></label><label className="form-field full-field"><span>Links as JSON array (each item has label and href)</span><textarea rows="6" value={navigationText} onChange={(event) => setNavigationText(event.target.value)} /></label></div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Footer</p><h2>Footer content</h2></div></div><div className="form-grid"><label className="form-field full-field"><span>Description</span><input value={footer.description} onChange={(event) => setFooter({ ...footer, description: event.target.value })} /></label><label className="form-field full-field"><span>Copyright text</span><input value={footer.copyrightText} onChange={(event) => setFooter({ ...footer, copyrightText: event.target.value })} /></label></div></section>
      <section className="panel settings-panel settings-route-card"><div><p className="eyebrow">Access experience</p><h2>Admin authentication</h2><p className="muted-text">Set up demo credentials and customize the search-style sign-in page.</p></div><Link className="button button-subtle" to="/admin/settings/authentication">Manage authentication <span aria-hidden="true">→</span></Link></section>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="settings-bottom"><div><button type="submit" className="button button-primary"><Save size={16} /> Save settings</button></div><div><button type="button" className="button button-subtle" onClick={exportData}><Download size={16} /> Export JSON</button><button type="button" className="button button-danger" onClick={resetData}><RotateCcw size={16} /> Reset mock data</button></div></div>
    </form>
  </div>;
}
