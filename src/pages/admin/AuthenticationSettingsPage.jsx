import { useState } from 'react';
import { KeyRound, Save, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { usePortfolio } from '../../hooks/usePortfolio';
import { createSecretCredential } from '../../services/authService';

export default function AuthenticationSettingsPage() {
  const { portfolio, updateSection } = usePortfolio();
  const [settings, setSettings] = useState({ ...portfolio.authSettings });
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerConfirm, setAnswerConfirm] = useState('');
  const [error, setError] = useState('');
  const credentials = portfolio.authCredentials || {};
  const set = (key, value) => setSettings((current) => ({ ...current, [key]: value }));

  const save = async (event) => {
    event.preventDefault();
    const changingQuestion = settings.securityQuestion !== portfolio.authSettings.securityQuestion;
    const requiresAnswer = settings.authenticationMethod !== 'password-only';
    const nextCredentials = { ...credentials };
    if (password && password.length < 12) {
      setError('Use at least 12 characters for the new password.');
      return;
    }
    if (password && password !== passwordConfirm) {
      setError('The password confirmation does not match.');
      return;
    }
    if (answer && answer.length < 8) {
      setError('Use at least 8 characters for the security answer.');
      return;
    }
    if (answer && answer.trim().toLocaleLowerCase() !== answerConfirm.trim().toLocaleLowerCase()) {
      setError('The security answer confirmation does not match.');
      return;
    }
    if ((!nextCredentials.password && !password) || (requiresAnswer && !nextCredentials.securityAnswer && !answer)) {
      setError('Set a password and security answer before enabling the mock login.');
      return;
    }
    if (requiresAnswer && changingQuestion && !answer) {
      setError('Set a new security answer when changing the security question.');
      return;
    }
    try {
      if (password) nextCredentials.password = await createSecretCredential(password);
      if (answer) nextCredentials.securityAnswer = await createSecretCredential(answer, true);
      updateSection('authSettings', settings);
      updateSection('authCredentials', nextCredentials);
      setPassword('');
      setPasswordConfirm('');
      setAnswer('');
      setAnswerConfirm('');
      setError('');
      toast.success('Mock authentication settings saved.');
    } catch (saveError) {
      console.error('Unable to update mock authentication settings.', saveError);
      setError('Credentials could not be saved with this browser. Use a modern browser over HTTPS or localhost.');
    }
  };

  return <div className="admin-page">
    <div className="page-title-row"><div><p className="eyebrow">Workspace settings</p><h1>Authentication</h1><p className="admin-description">Configure a local demo sign-in flow. This does not secure admin routes.</p></div></div>
    <form className="settings-stack" onSubmit={save}>
      <div className="mock-auth-notice settings-security-notice"><ShieldAlert size={18} /><div><strong>Development-only authentication</strong><p>Passwords and security answers are never saved as plain text; this prototype stores salted PBKDF2 hashes in browser storage. Client-side checks are not production security and do not protect admin routes.</p></div></div>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Account</p><h2>Admin details</h2></div><KeyRound size={17} /></div><div className="form-grid">
        <label className="form-field"><span>Admin email</span><input type="email" required value={settings.adminEmail} onChange={(event) => set('adminEmail', event.target.value)} /></label>
        <label className="form-field"><span>Admin phone</span><input type="tel" value={settings.adminPhone} onChange={(event) => set('adminPhone', event.target.value)} placeholder="Optional verification match" /></label>
        <label className="form-field"><span>Authentication method</span><select value={settings.authenticationMethod} onChange={(event) => set('authenticationMethod', event.target.value)}><option value="password-question">Password + security question</option><option value="password-only">Password only</option></select></label>
        <label className="form-field"><span>Demo session duration</span><select value={settings.sessionDurationMinutes} onChange={(event) => set('sessionDurationMinutes', Number(event.target.value))}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">1 hour</option><option value="120">2 hours</option><option value="480">8 hours</option></select></label>
      </div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Login appearance</p><h2>Welcome screen</h2></div></div><div className="form-grid">
        <label className="form-field"><span>Welcome title</span><input value={settings.loginTitle} onChange={(event) => set('loginTitle', event.target.value)} /></label>
        <label className="form-field"><span>Welcome subtitle</span><input value={settings.loginSubtitle} onChange={(event) => set('loginSubtitle', event.target.value)} /></label>
        <label className="form-field"><span>Appearance</span><select value={settings.loginAppearance} onChange={(event) => set('loginAppearance', event.target.value)}><option value="minimal">Minimal</option><option value="workspace">Workspace</option></select></label>
        <label className="form-field"><span>Security question</span><input required value={settings.securityQuestion} onChange={(event) => set('securityQuestion', event.target.value)} /></label>
      </div></section>
      <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">Credentials</p><h2>{credentials.password ? 'Change password' : 'Set demo password'}</h2></div></div><div className="form-grid">
        <label className="form-field"><span>New password</span><input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={credentials.password ? 'Leave blank to keep current' : 'At least 12 characters'} /></label>
        <label className="form-field"><span>Confirm new password</span><input type="password" autoComplete="new-password" value={passwordConfirm} onChange={(event) => setPasswordConfirm(event.target.value)} /></label>
        <label className="form-field"><span>{credentials.securityAnswer ? 'New security answer' : 'Set security answer'}</span><input type="password" autoComplete="off" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={credentials.securityAnswer ? 'Leave blank to keep current' : 'At least 8 characters'} /></label>
        <label className="form-field"><span>Confirm security answer</span><input type="password" autoComplete="off" value={answerConfirm} onChange={(event) => setAnswerConfirm(event.target.value)} /></label>
      </div><p className="muted-text credential-note">Only salted one-way hashes are saved in this prototype. Update either credential by entering it here; raw values are cleared after saving.</p></section>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="settings-bottom"><span className="muted-text">{credentials.password ? 'Demo password configured' : 'Demo password not configured'}</span><button className="button button-primary" type="submit"><Save size={16} /> Save authentication settings</button></div>
    </form>
  </div>;
}
