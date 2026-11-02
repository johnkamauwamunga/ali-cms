import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { PortfolioProvider } from './providers/PortfolioProvider';

export default function App() {
  return <PortfolioProvider><RouterProvider router={router} /><Toaster position="bottom-right" richColors /></PortfolioProvider>;
}
