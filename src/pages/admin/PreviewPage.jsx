import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import HomePage from '../public/HomePage';

export default function PreviewPage() {
  return <><div className="preview-banner"><Link to="/admin" className="button button-subtle"><ArrowLeft size={16} /> Back to dashboard</Link><span>Portfolio preview · draft content is not shown</span><Link to="/" target="_blank" className="text-link">Open public site ↗</Link></div><HomePage /></>;
}
