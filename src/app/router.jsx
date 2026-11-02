import { createBrowserRouter } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import CollectionManager from '../components/admin/CollectionManager';
import DashboardPage from '../pages/admin/DashboardPage';
import ProfilePage from '../pages/admin/ProfilePage';
import SettingsPage from '../pages/admin/SettingsPage';
import PreviewPage from '../pages/admin/PreviewPage';
import CvGeneratorPage from '../pages/admin/CvGeneratorPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AuthenticationSettingsPage from '../pages/admin/AuthenticationSettingsPage';
import HomePage from '../pages/public/HomePage';
import ProjectsPage, { NotFoundPage, ProjectDetailsPage } from '../pages/public/ProjectsPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/projects/:slug', element: <ProjectDetailsPage /> },
  { path: '/admin/preview', element: <PreviewPage /> },
  { path: '/admin/login', element: <AdminLoginPage /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'experience', element: <CollectionManager collection="experience" /> },
      { path: 'skills', element: <CollectionManager collection="skills" /> },
      { path: 'projects', element: <CollectionManager collection="projects" /> },
      { path: 'education', element: <CollectionManager collection="education" /> },
      { path: 'certifications', element: <CollectionManager collection="certifications" /> },
      { path: 'interests', element: <CollectionManager collection="interests" /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'settings/authentication', element: <AuthenticationSettingsPage /> },
      { path: 'cv', element: <CvGeneratorPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
