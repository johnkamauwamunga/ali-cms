import { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Search, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../hooks/usePortfolio';
import { verifySecret } from '../../services/authService';

export default function AdminLoginPage() {
  const { portfolio } = usePortfolio();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('email');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [answer, setAnswer] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!portfolio) return <div className="loading-screen">Loading workspace…</div>;
  const authSettings = portfolio.authSettings;
  const asksQuestion = authSettings.authenticationMethod !== 'password-only';

  const continueWithEmail = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address to continue.');
      return;
    }
    setBusy(true);
    setError('');
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    setStage('credentials');
    setBusy(false);
  };

  const signIn = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const emailMatches = email.trim().toLowerCase() === authSettings.adminEmail.trim().toLowerCase();
      const phoneMatches = !authSettings.adminPhone || phone.trim() === authSettings.adminPhone.trim();
      const credentials = portfolio.authCredentials;
      const passwordMatches = await verifySecret(password, credentials?.password);
      const answerMatches = !asksQuestion || await verifySecret(answer, credentials?.securityAnswer, true);
      if (!emailMatches || !phoneMatches || !passwordMatches || !answerMatches) {
        setError('Unable to continue. Check your details or review the demo authentication settings.');
        return;
      }
      navigate('/admin');
    } catch (verificationError) {
      console.error('Mock sign-in verification failed.', verificationError);
      setError('The demo sign-in could not be completed in this browser.');
    } finally {
      setBusy(false);
    }
  };

  return <main className={`login-page login-appearance-${authSettings.loginAppearance || 'minimal'}`}>
    <header className="login-topbar"><Link to="/" className="brand"><span className="brand-mark">{portfolio.navigation.logo}</span><span>{portfolio.profile.fullName}</span></Link><span>Portfolio CMS</span></header>
    <section className="login-card">
      <div className="login-brand-mark">{portfolio.navigation.logo}</div>
      <p className="eyebrow">{stage === 'email' ? 'Your workspace awaits' : 'Account verification'}</p>
      <h1>{authSettings.loginTitle || 'Welcome back'}</h1>
      <p className="login-subtitle">{authSettings.loginSubtitle || 'Your Portfolio Workspace'}</p>
      <div className="login-progress" aria-label={stage === 'email' ? 'Step 1 of 2' : 'Step 2 of 2'}><span className={stage === 'email' ? 'current' : 'complete'} /><span className={stage === 'credentials' ? 'current' : ''} /></div>
      {stage === 'email' ? <form onSubmit={continueWithEmail} className="login-form">
        <label className="form-field" htmlFor="admin-email"><span>Admin email</span><div className="search-login-field"><Search size={19} aria-hidden="true" /><input id="admin-email" type="email" autoComplete="email" placeholder="Search your workspace…" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} autoFocus /><button type="button" className="icon-button" aria-label="Clear email" onClick={() => setEmail('')}><span aria-hidden="true">×</span></button><button type="submit" className="icon-button search-submit" aria-label="Search workspace" disabled={busy}>{busy ? <span className="login-spinner" /> : <Search size={17} />}</button></div></label>
        <p className="login-hint">Enter your admin email to continue.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="button button-primary login-submit" disabled={busy}>{busy ? 'Searching…' : 'Continue'} {!busy && <ArrowRight size={16} />}</button>
      </form> : <form onSubmit={signIn} className="login-form credential-form">
        <button className="login-back" type="button" onClick={() => { setStage('email'); setError(''); }}><ArrowLeft size={14} /> Change email</button>
        <label className="form-field"><span>Email address</span><input type="email" value={email} readOnly /></label>
        <label className="form-field"><span>Phone number</span><input type="tel" autoComplete="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+971 50 000 0000" /></label>
        <label className="form-field"><span>Password</span><div className="password-field"><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /><button className="icon-button" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {asksQuestion && <><p className="login-question">{authSettings.securityQuestion}</p><label className="form-field"><span>Security answer</span><input type="password" autoComplete="off" required value={answer} onChange={(event) => setAnswer(event.target.value)} /></label></>}
        <div className="mock-auth-notice"><ShieldAlert size={16} /><span>Development-only mock sign-in. Admin routes are not protected by this screen.</span></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!portfolio.authCredentials && <Link className="login-setup-link" to="/admin/settings/authentication">Configure demo credentials in Authentication settings</Link>}
        <button type="submit" className="button button-primary login-submit" disabled={busy}>{busy ? 'Checking…' : 'Continue to workspace'} {!busy && <ArrowRight size={16} />}</button>
      </form>}
    </section>
    <footer className="login-footer"><span>Demo access only · Not production authentication</span><Link to="/admin">Open workspace</Link></footer>
  </main>;
}
