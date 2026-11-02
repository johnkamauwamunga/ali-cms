import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Eye, FileText, Plus, Printer, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ImageWithFallback } from '../../components/ImageWithFallback';

const sectionLabels = {
  summary: 'Professional summary',
  experience: 'Work experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  projects: 'Projects',
  references: 'References',
};

const selectableSections = ['experience', 'education', 'skills', 'certifications', 'projects', 'references'];

function formatDate(value) {
  if (!value) return '';
  const date = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
}

function ReferenceForm({ reference, onCancel, onSave }) {
  const [values, setValues] = useState(reference || {
    fullName: '', jobTitle: '', organization: '', relationship: '', email: '', phone: '', location: '',
    published: true, includeInCV: false,
  });
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  return <form className="reference-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}>
    <div className="form-grid">
      {[
        ['fullName', 'Full name', 'text'], ['jobTitle', 'Job title', 'text'], ['organization', 'Organization', 'text'],
        ['relationship', 'Relationship', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['location', 'Location', 'text'],
      ].map(([key, label, type]) => <label className="form-field" key={key}><span>{label}</span><input type={type} required={key === 'fullName'} value={values[key] || ''} onChange={(event) => set(key, event.target.value)} /></label>)}
      <label className="visibility-option"><span>Include in CV</span><input type="checkbox" checked={Boolean(values.includeInCV)} onChange={(event) => set('includeInCV', event.target.checked)} /></label>
    </div>
    <div className="modal-actions"><button type="button" className="button button-subtle" onClick={onCancel}>Cancel</button><button type="submit" className="button button-primary"><Check size={15} /> Save reference</button></div>
  </form>;
}

function CvDocument({ portfolio, config }) {
  const { profile, contact } = portfolio;
  const selectedIds = config.selectedIds || {};
  const enabledSections = {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: config.showCertifications !== false,
    projects: config.showProjects !== false,
    references: config.showReferences === true,
    ...config.enabledSections,
  };
  const entries = (collection) => (portfolio[collection] || [])
    .filter((entry) => selectedIds[collection]?.includes(entry.id))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const references = (portfolio.references || [])
    .filter((reference) => reference.includeInCV)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const socials = contact.socialLinks || profile.socialLinks || {};
  const sectionContent = {
    summary: <p className="cv-paragraph">{config.summary || profile.biography}</p>,
    experience: entries('experience').map((job) => <article className="cv-entry" key={job.id}>
      <div className="cv-entry-heading"><strong>{job.title}</strong><span>{formatDate(job.startDate)} — {job.current ? 'Present' : formatDate(job.endDate)}</span></div>
      <p className="cv-entry-subtitle">{job.company} · {job.location}</p>
      {[...(job.responsibilities || []), ...(job.achievements || [])].map((line, index) => <p className="cv-bullet" key={`${job.id}-${index}`}>{line}</p>)}
    </article>),
    education: entries('education').map((item) => <article className="cv-entry" key={item.id}>
      <div className="cv-entry-heading"><strong>{item.qualification} in {item.fieldOfStudy}</strong><span>{formatDate(item.startDate)} — {formatDate(item.endDate)}</span></div>
      <p className="cv-entry-subtitle">{item.institution} · {item.location}</p>
      {item.description && <p className="cv-paragraph">{item.description}</p>}
    </article>),
    skills: <p className="cv-paragraph">{entries('skills').map((skill) => skill.name).join(' · ')}</p>,
    certifications: entries('certifications').map((item) => <article className="cv-entry" key={item.id}>
      <div className="cv-entry-heading"><strong>{item.name}</strong><span>{formatDate(item.issueDate)}</span></div>
      <p className="cv-entry-subtitle">{item.issuer}{item.credentialId ? ` · Credential ${item.credentialId}` : ''}</p>
    </article>),
    projects: entries('projects').map((item) => <article className="cv-entry" key={item.id}>
      <div className="cv-entry-heading"><strong>{item.title}</strong><span>{item.category}</span></div>
      <p className="cv-paragraph">{item.description}</p>
      <p className="cv-entry-subtitle">{(item.technologies || []).join(' · ')}</p>
    </article>),
    references: config.showReferences && references.length > 0 ? references.map((reference) => <article className="cv-entry" key={reference.id}>
      <div className="cv-entry-heading"><strong>{reference.fullName}</strong><span>{reference.jobTitle}</span></div>
      <p className="cv-entry-subtitle">{reference.organization}{reference.relationship ? ` · ${reference.relationship}` : ''}</p>
      {config.showReferenceEmail && reference.email && <p className="cv-entry-subtitle">{reference.email}</p>}
      {config.showReferencePhone && reference.phone && <p className="cv-entry-subtitle">{reference.phone}</p>}
    </article>) : [],
  };
  const order = config.sectionOrder || Object.keys(sectionLabels);
  const sections = order.filter((key) => key in sectionLabels && enabledSections[key]);
  return <article
    id="cv-document"
    className={`cv-document cv-template-${config.template}`}
    style={{ '--cv-accent': config.accentColor, '--cv-font-size': `${config.fontSize}px`, '--cv-margin': `${config.pageMargins}mm` }}
  >
    <header className="cv-header">
      {config.showProfileImage && <ImageWithFallback src={profile.profileImage} alt="" className="cv-profile-image" />}
      <div className="cv-identity"><h1>{profile.fullName}</h1><p className="cv-title">{profile.professionalTitle}</p><p className="cv-document-title">{config.title}</p></div>
      <p className="cv-contact-line">{[contact.email || profile.email, profile.phone, profile.location, socials.linkedin, socials.github].filter(Boolean).join('  |  ')}</p>
    </header>
    {sections.map((key) => {
      const content = sectionContent[key];
      if (!content || (Array.isArray(content) && content.length === 0)) return null;
      return <section className="cv-section" key={key}><h2>{sectionLabels[key]}</h2><div className="cv-section-content">{content}</div></section>;
    })}
  </article>;
}

export default function CvGeneratorPage() {
  const { portfolio, updateSection, create, update, remove, reorder } = usePortfolio();
  const [config, setConfig] = useState(() => ({ ...portfolio.cvSettings }));
  const [editingReference, setEditingReference] = useState(undefined);
  const [mobileView, setMobileView] = useState('editor');
  const [saved, setSaved] = useState(true);
  const referenceList = useMemo(() => [...portfolio.references].sort((a, b) => a.sortOrder - b.sortOrder), [portfolio.references]);
  const set = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }));
    setSaved(false);
  };
  const saveConfig = () => {
    updateSection('cvSettings', config);
    setSaved(true);
    toast.success('CV settings saved.');
  };
  const toggleRecord = (collection, id) => {
    const current = config.selectedIds?.[collection] || [];
    set('selectedIds', {
      ...config.selectedIds,
      [collection]: current.includes(id) ? current.filter((entryId) => entryId !== id) : [...current, id],
    });
  };
  const saveReference = async (values) => {
    try {
      if (editingReference?.id) await update('references', editingReference.id, values);
      else await create('references', values);
      setEditingReference(undefined);
      toast.success('Reference saved.');
    } catch (error) {
      toast.error(error.message || 'Reference could not be saved.');
    }
  };
  const deleteReference = async (reference) => {
    if (!window.confirm(`Remove ${reference.fullName} from your references?`)) return;
    await remove('references', reference.id);
    set('selectedIds', { ...config.selectedIds, references: (config.selectedIds.references || []).filter((id) => id !== reference.id) });
    toast.success('Reference removed.');
  };
  const selectedEntries = (collection) => portfolio[collection] || [];
  const moveSection = (index, direction) => {
    const next = [...config.sectionOrder];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    set('sectionOrder', next);
  };
  const printCv = () => window.print();

  return <div className="admin-page cv-generator">
    <div className="page-title-row cv-page-heading"><div><p className="eyebrow">Document studio</p><h1>CV generator</h1><p className="admin-description">Build a tailored, print-ready CV from your portfolio content.</p></div><div className="cv-top-actions"><button className="button button-subtle mobile-cv-switch" onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')}><Eye size={15} /> {mobileView === 'editor' ? 'Preview' : 'Editor'}</button><button className="button button-primary" onClick={printCv}><Printer size={15} /> Print / Save PDF</button></div></div>
    <div className={`cv-workspace mobile-${mobileView}`}>
      <section className="cv-editor">
        <div className="panel cv-config-panel"><div className="panel-heading"><div><p className="eyebrow">Document details</p><h2>CV configuration</h2></div><FileText size={17} /></div>
          <div className="cv-form-grid">
            <label className="form-field"><span>CV title</span><input value={config.title || ''} onChange={(event) => set('title', event.target.value)} /></label>
            <label className="form-field"><span>Template</span><select value={config.template} onChange={(event) => set('template', event.target.value)}><option value="professional">Professional · ATS</option><option value="modern">Modern · ATS</option></select></label>
            <label className="form-field full-field"><span>Professional summary</span><textarea rows="4" value={config.summary || ''} onChange={(event) => set('summary', event.target.value)} placeholder={portfolio.profile.biography} /></label>
            <label className="form-field"><span>Font size ({config.fontSize}px)</span><input type="range" min="9" max="12" value={config.fontSize} onChange={(event) => set('fontSize', Number(event.target.value))} /></label>
            <label className="form-field"><span>Page margins ({config.pageMargins} mm)</span><input type="range" min="12" max="24" value={config.pageMargins} onChange={(event) => set('pageMargins', Number(event.target.value))} /></label>
            <label className="form-field"><span>Accent color</span><div className="color-control"><input type="color" value={config.accentColor} onChange={(event) => set('accentColor', event.target.value)} /><input value={config.accentColor} onChange={(event) => set('accentColor', event.target.value)} /></div></label>
            <label className="visibility-option"><span>Show profile image</span><input type="checkbox" checked={Boolean(config.showProfileImage)} onChange={(event) => set('showProfileImage', event.target.checked)} /></label>
          </div>
        </div>
        <div className="panel cv-config-panel"><div className="panel-heading"><div><p className="eyebrow">Choose content</p><h2>CV sections</h2></div></div>
          <div className="cv-sections-config">
            {config.sectionOrder.map((key, index) => <div className="cv-order-row" key={key}><span className="cv-order-controls"><button className="icon-button" disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`Move ${sectionLabels[key]} up`}><ArrowUp size={14} /></button><button className="icon-button" disabled={index === config.sectionOrder.length - 1} onClick={() => moveSection(index, 1)} aria-label={`Move ${sectionLabels[key]} down`}><ArrowDown size={14} /></button></span><strong>{sectionLabels[key]}</strong><label className="cv-section-enabled"><input type="checkbox" checked={Boolean(config.enabledSections?.[key] ?? (key === 'references' ? config.showReferences : key === 'projects' ? config.showProjects : key === 'certifications' ? config.showCertifications : true))} onChange={(event) => { const enabled = { ...config.enabledSections, [key]: event.target.checked }; set('enabledSections', enabled); if (key === 'references') set('showReferences', event.target.checked); if (key === 'projects') set('showProjects', event.target.checked); if (key === 'certifications') set('showCertifications', event.target.checked); }} aria-label={`Include ${sectionLabels[key]}`} /></label></div>)}
          </div>
          {selectableSections.filter((collection) => collection !== 'references' && (config.enabledSections?.[collection] ?? (collection === 'projects' ? config.showProjects : collection === 'certifications' ? config.showCertifications : true))).map((collection) => <div className="cv-select-group" key={collection}><h3>{sectionLabels[collection]}</h3><div className="cv-select-list">{selectedEntries(collection).map((entry) => <label key={entry.id}><input type="checkbox" checked={(config.selectedIds?.[collection] || []).includes(entry.id)} onChange={() => toggleRecord(collection, entry.id)} /><span>{entry.name || entry.title || entry.institution}</span></label>)}</div></div>)}
        </div>
        <div className="panel cv-config-panel"><div className="panel-heading"><div><p className="eyebrow">Professional contacts</p><h2>References</h2></div><button className="icon-button" aria-label="Add reference" onClick={() => setEditingReference(null)}><Plus size={18} /></button></div>
          <div className="reference-list">{referenceList.map((reference, index) => <article className="reference-row" key={reference.id}><span className="cv-order-controls"><button className="icon-button" disabled={index === 0} onClick={() => reorder('references', reference.id, -1)} aria-label={`Move ${reference.fullName} up`}><ArrowUp size={14} /></button><button className="icon-button" disabled={index === referenceList.length - 1} onClick={() => reorder('references', reference.id, 1)} aria-label={`Move ${reference.fullName} down`}><ArrowDown size={14} /></button></span><div className="reference-row-main"><strong>{reference.fullName}</strong><span>{reference.jobTitle} · {reference.organization}</span></div><label className="include-reference"><input type="checkbox" checked={Boolean(reference.includeInCV)} onChange={(event) => update('references', reference.id, { ...reference, includeInCV: event.target.checked })} /><span>CV</span></label><div className="row-actions"><button className="icon-button" aria-label={`Edit ${reference.fullName}`} onClick={() => setEditingReference(reference)}><FileText size={15} /></button><button className="icon-button danger-hover" aria-label={`Remove ${reference.fullName}`} onClick={() => deleteReference(reference)}><Trash2 size={15} /></button></div></article>)}
            {!referenceList.length && <p className="muted-text">Add references here. They are never shown on the public portfolio.</p>}
          </div>
          <div className="cv-reference-options">
            <label className="visibility-option"><span>Include reference email</span><input type="checkbox" checked={Boolean(config.showReferenceEmail)} onChange={(event) => set('showReferenceEmail', event.target.checked)} /></label>
            <label className="visibility-option"><span>Include reference phone</span><input type="checkbox" checked={Boolean(config.showReferencePhone)} onChange={(event) => set('showReferencePhone', event.target.checked)} /></label>
          </div>
        </div>
        <div className="cv-save-row"><span className="muted-text">{saved ? 'Saved' : 'Unsaved changes'}</span><button className="button button-primary" onClick={saveConfig}><Check size={15} /> Save CV settings</button></div>
      </section>
      <section className="cv-preview-column"><div className="cv-preview-label"><span>Live preview</span><span>A4 · {config.template}</span></div><div className="cv-preview-scroll"><CvDocument portfolio={portfolio} config={config} /></div></section>
    </div>
    {editingReference !== undefined && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditingReference(undefined)}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="reference-title"><div className="modal-header"><div><p className="eyebrow">CV contacts</p><h2 id="reference-title">{editingReference ? 'Edit reference' : 'Add reference'}</h2></div><button className="icon-button" aria-label="Close" onClick={() => setEditingReference(undefined)}><X size={18} /></button></div><ReferenceForm reference={editingReference} onCancel={() => setEditingReference(undefined)} onSave={saveReference} /></section></div>}
  </div>;
}
