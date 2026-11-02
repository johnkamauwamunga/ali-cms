import { useState } from 'react';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '../../hooks/usePortfolio';
import { ImageWithFallback } from '../../components/ImageWithFallback';

export default function ProfilePage() {
  const { portfolio, updateProfile, updateSection } = usePortfolio();
  const [values, setValues] = useState(() => ({ ...portfolio.profile }));
  const [about, setAbout] = useState(() => ({ ...portfolio.about }));
  const [statisticsText, setStatisticsText] = useState(() => JSON.stringify(portfolio.about.statistics || [], null, 2));
  const [error, setError] = useState('');
  const set = (key, value) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    let statistics;
    try {
      statistics = JSON.parse(statisticsText);
      if (!Array.isArray(statistics)) throw new Error('Expected a JSON array.');
    } catch {
      setError('Professional statistics must be entered as a valid JSON array.');
      return;
    }
    updateProfile(values);
    updateSection('about', { ...about, statistics });
    updateSection('contact', {
      email: values.email,
      location: values.location,
      socialLinks: values.socialLinks,
    });
    setError('');
    toast.success('Profile updated.');
  };
  return <div className="admin-page">
    <div className="page-title-row"><div><p className="eyebrow">Portfolio identity</p><h1>Profile</h1><p className="admin-description">Your details appear across the public portfolio.</p></div></div>
    <form className="panel editor-panel" onSubmit={submit}>
      <div className="profile-form-top"><ImageWithFallback src={values.profileImage} alt={values.fullName} className="profile-preview" /><div><p className="eyebrow">Profile image</p><label className="form-field"><span>Image URL</span><input value={values.profileImage} onChange={(event) => set('profileImage', event.target.value)} /></label></div></div>
      <div className="form-grid">
        <label className="form-field"><span>Full name</span><input required value={values.fullName} onChange={(event) => set('fullName', event.target.value)} /></label>
        <label className="form-field"><span>First name</span><input value={values.firstName} onChange={(event) => set('firstName', event.target.value)} /></label>
        <label className="form-field"><span>Professional title</span><input required value={values.professionalTitle} onChange={(event) => set('professionalTitle', event.target.value)} /></label>
        <label className="form-field"><span>Location</span><input value={values.location} onChange={(event) => set('location', event.target.value)} /></label>
        <label className="form-field"><span>Email</span><input required type="email" value={values.email} onChange={(event) => set('email', event.target.value)} /></label>
        <label className="form-field"><span>Phone</span><input value={values.phone} onChange={(event) => set('phone', event.target.value)} /></label>
        <label className="form-field full-field"><span>Tagline</span><input value={values.tagline} onChange={(event) => set('tagline', event.target.value)} /></label>
        <label className="form-field full-field"><span>Short introduction</span><textarea rows="2" value={values.shortIntroduction} onChange={(event) => set('shortIntroduction', event.target.value)} /></label>
        <label className="form-field full-field"><span>Biography</span><textarea rows="5" value={values.biography} onChange={(event) => set('biography', event.target.value)} /></label>
        <label className="form-field full-field"><span>About section title</span><input value={about.title} onChange={(event) => setAbout({ ...about, title: event.target.value })} /></label>
        <label className="form-field full-field"><span>About section description</span><textarea rows="2" value={about.description} onChange={(event) => setAbout({ ...about, description: event.target.value })} /></label>
        <label className="form-field full-field"><span>Professional statistics (JSON array of label/value objects)</span><textarea rows="4" value={statisticsText} onChange={(event) => setStatisticsText(event.target.value)} /></label>
        <label className="form-field"><span>GitHub URL</span><input type="url" value={values.socialLinks.github || ''} onChange={(event) => set('socialLinks', { ...values.socialLinks, github: event.target.value })} /></label>
        <label className="form-field"><span>LinkedIn URL</span><input type="url" value={values.socialLinks.linkedin || ''} onChange={(event) => set('socialLinks', { ...values.socialLinks, linkedin: event.target.value })} /></label>
        <label className="form-field full-field"><span>CV URL</span><input type="url" value={values.cvUrl} onChange={(event) => set('cvUrl', event.target.value)} /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions"><button className="button button-primary" type="submit"><Save size={16} /> Save profile</button></div>
    </form>
  </div>;
}
