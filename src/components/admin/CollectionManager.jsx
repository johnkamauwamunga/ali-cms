import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Check, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '../../hooks/usePortfolio';

export const collectionDefinitions = {
  experience: {
    title: 'Experience', singular: 'experience entry', description: 'Manage roles and professional history.', primary: 'title',
    fields: [['title', 'Job title'], ['company', 'Company'], ['location', 'Location'], ['employmentType', 'Employment type'], ['startDate', 'Start date'], ['endDate', 'End date'], ['companyLogo', 'Company image URL'], ['responsibilities', 'Responsibilities (JSON array)', 'array'], ['achievements', 'Achievements (JSON array)', 'array'], ['technologies', 'Technologies (JSON array)', 'array'], ['current', 'Currently working here', 'checkbox']],
  },
  skills: {
    title: 'Skills', singular: 'skill', description: 'Group and order the skills shown on your portfolio.', primary: 'name',
    fields: [['name', 'Skill name'], ['category', 'Category'], ['icon', 'Icon identifier'], ['iconSource', 'Icon source']],
  },
  projects: {
    title: 'Projects', singular: 'project', description: 'Showcase projects, links, and technologies.', primary: 'title',
    fields: [['title', 'Project title'], ['slug', 'URL slug'], ['category', 'Category'], ['description', 'Description', 'long'], ['image', 'Project image URL'], ['technologies', 'Technologies (JSON array)', 'array'], ['githubUrl', 'GitHub URL'], ['liveUrl', 'Live demo URL'], ['featured', 'Featured project', 'checkbox']],
  },
  education: {
    title: 'Education', singular: 'education record', description: 'Manage your academic background.', primary: 'institution',
    fields: [['institution', 'Institution'], ['qualification', 'Qualification'], ['fieldOfStudy', 'Field of study'], ['startDate', 'Start date'], ['endDate', 'End date'], ['location', 'Location'], ['description', 'Description', 'long']],
  },
  certifications: {
    title: 'Certifications', singular: 'certification', description: 'Manage credentials and verification links.', primary: 'name',
    fields: [['name', 'Certification name'], ['issuer', 'Issuing organization'], ['issueDate', 'Issue date'], ['expirationDate', 'Expiration date'], ['credentialId', 'Credential ID'], ['credentialUrl', 'Credential URL'], ['image', 'Certificate image URL']],
  },
  interests: {
    title: 'Interests', singular: 'interest', description: 'Share a few things you enjoy beyond work.', primary: 'title',
    fields: [['title', 'Title'], ['description', 'Description', 'long'], ['image', 'Image URL']],
  },
};

function blankRecord(definition) {
  return Object.fromEntries(definition.fields.map(([key, , type]) => [key, type === 'array' ? [] : type === 'checkbox' ? false : '']));
}

function RecordDialog({ definition, record, onClose, onSave }) {
  const [values, setValues] = useState(() => record ? { ...record } : { ...blankRecord(definition), published: true });
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next = { ...values };
    for (const [key, , type] of definition.fields) {
      if (type === 'array') {
        try {
          const parsed = JSON.parse(String(formData.get(key) || '[]'));
          if (!Array.isArray(parsed)) throw new Error('must be a JSON array');
          next[key] = parsed;
        } catch {
          setError(`${definition.fields.find((field) => field[0] === key)?.[1]} must be valid JSON array syntax.`);
          return;
        }
      } else if (type === 'checkbox') next[key] = formData.get(key) === 'on';
      else next[key] = String(formData.get(key) || '').trim();
    }
    next.published = formData.get('published') === 'on';
    if (definition.fields.some(([key, label]) => ['title', 'name', 'institution'].includes(key) && !next[key])) {
      setError('Please complete the name or title field.');
      return;
    }
    setError('');
    onSave(next);
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-header"><div><p className="eyebrow">{record ? 'Edit entry' : 'New entry'}</p><h2 id="modal-title">{record ? `Edit ${definition.singular}` : `Add ${definition.singular}`}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
    <form onSubmit={submit}><div className="form-grid">{definition.fields.map(([key, label, type]) => <label key={key} className={type === 'long' || type === 'array' ? 'form-field full-field' : 'form-field'}>
      <span>{label}</span>
      {type === 'checkbox' ? <input type="checkbox" name={key} checked={Boolean(values[key])} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.checked }))} /> :
        key === 'iconSource' ? <select name={key} defaultValue={values[key] || 'simple-icons'}><option value="simple-icons">Simple Icons</option><option value="lucide">Lucide</option></select> :
        type === 'long' || type === 'array' ? <textarea name={key} rows={type === 'array' ? 4 : 3} defaultValue={type === 'array' ? JSON.stringify(values[key] || [], null, 2) : values[key]} placeholder={type === 'array' ? '["Item one", "Item two"]' : ''} /> :
          <input name={key} required={['title', 'name', 'institution'].includes(key)} type={key.toLowerCase().includes('date') ? 'month' : 'text'} defaultValue={values[key] || ''} />}
    </label>)}
      <label className="form-field published-field"><span>Published on portfolio</span><input type="checkbox" name="published" defaultChecked={values.published ?? true} /></label>
    </div>{error && <p className="form-error" role="alert">{error}</p>}<div className="modal-actions"><button type="button" className="button button-subtle" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary"><Check size={16} /> Save changes</button></div></form>
  </section></div>;
}

export default function CollectionManager({ collection }) {
  const { portfolio, create, update, remove, reorder } = usePortfolio();
  const definition = collectionDefinitions[collection];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState(undefined);
  const entries = portfolio?.[collection] || [];
  const filtered = useMemo(() => entries.filter((entry) => {
    const matchesText = JSON.stringify(entry).toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === 'all' || (status === 'published' ? entry.published : !entry.published);
    return matchesText && matchesStatus;
  }).sort((a, b) => a.sortOrder - b.sortOrder), [entries, query, status]);

  const save = async (values) => {
    try {
      if (editing?.id) await update(collection, editing.id, values);
      else await create(collection, values);
      toast.success(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} ${editing?.id ? 'updated' : 'created'}.`);
      setEditing(undefined);
    } catch (error) {
      toast.error(error.message || 'The entry could not be saved.');
    }
  };
  const deleteEntry = async (entry) => {
    if (!window.confirm(`Delete “${entry[definition.primary]}”? This cannot be undone.`)) return;
    try {
      await remove(collection, entry.id);
      toast.success(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} deleted.`);
    } catch (error) {
      toast.error(error.message || 'The entry could not be deleted.');
    }
  };
  const togglePublished = async (entry) => {
    try {
      await update(collection, entry.id, { ...entry, published: !entry.published });
      toast.success(entry.published ? 'Entry unpublished.' : 'Entry published.');
    } catch (error) {
      toast.error(error.message || 'Publication status could not be changed.');
    }
  };

  return <div className="admin-page">
    <div className="page-title-row"><div><p className="eyebrow">Content</p><h1>{definition.title}</h1><p className="admin-description">{definition.description}</p></div><button className="button button-primary" onClick={() => setEditing(null)}><Plus size={16} /> Add {definition.singular}</button></div>
    <div className="collection-toolbar"><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${definition.title.toLowerCase()}…`} aria-label={`Search ${definition.title}`} /></label><select className="select-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by publication status"><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option></select><span className="result-count">{filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}</span></div>
    <div className="collection-list">{filtered.map((entry) => <article className="collection-row" key={entry.id}><div className="row-order"><button className="icon-button" aria-label="Move up" onClick={() => reorder(collection, entry.id, -1)}><ArrowUp size={15} /></button><button className="icon-button" aria-label="Move down" onClick={() => reorder(collection, entry.id, 1)}><ArrowDown size={15} /></button></div><div className="row-main"><div className="row-title"><h2>{entry[definition.primary] || 'Untitled entry'}</h2><span className={entry.published ? 'status-pill published' : 'status-pill draft'}>{entry.published ? 'Published' : 'Draft'}</span></div><p>{entry.company || entry.category || entry.institution || entry.issuer || entry.description || 'No additional details'}</p></div><div className="row-actions"><label className="publish-control"><input type="checkbox" checked={Boolean(entry.published)} onChange={() => togglePublished(entry)} /><span>Published</span></label><button className="icon-button" aria-label={`Edit ${entry[definition.primary]}`} onClick={() => setEditing(entry)}><Edit3 size={16} /></button><button className="icon-button danger-hover" aria-label={`Delete ${entry[definition.primary]}`} onClick={() => deleteEntry(entry)}><Trash2 size={16} /></button></div></article>)}
      {!filtered.length && <div className="empty-state"><div className="empty-icon"><Plus size={20} /></div><h2>{entries.length ? 'No matching entries' : `No ${definition.title.toLowerCase()} yet`}</h2><p>{entries.length ? 'Try another search or filter.' : 'Add your first entry to get started.'}</p>{!entries.length && <button className="button button-primary" onClick={() => setEditing(null)}><Plus size={15} /> Add {definition.singular}</button>}</div>}
    </div>
    {editing !== undefined && <RecordDialog definition={definition} record={editing} onClose={() => setEditing(undefined)} onSave={save} />}
  </div>;
}
