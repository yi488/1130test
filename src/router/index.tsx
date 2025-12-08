import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../pages/HomePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { BrowsingHistoryPage } from '../pages/BrowsingHistoryPage';
import { AdminPage } from '../pages/AdminPage';
import AboutPage from '../pages/AboutPage';
import SettingsPage from '../pages/SettingsPage';
import AIAssistant from '../components/AIAssistant';
import MapExploration from '../components/MapExploration';
import ThreeDArtifacts from '../components/ThreeDArtifacts';

import { User } from '../types';

interface AppRouterProps {
  currentUser?: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export function AppRouter({ currentUser, onLoginClick, onLogoutClick }: AppRouterProps) {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout currentUser={currentUser} onLoginClick={onLoginClick} onLogoutClick={onLogoutClick} />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: 'favorites',
          element: <FavoritesPage />,
        },
        {
          path: 'browsing-history',
          element: <BrowsingHistoryPage />,
        },
        {
          path: '3d-artifacts',
          element: <ThreeDArtifacts />,
        },
        {
          path: 'ai-assistant',
          element: <AIAssistant />,
        },
        {
          path: 'map-exploration',
          element: <MapExploration />,
        },
        {
          path: 'about',
          element: <AboutPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
        {
          path: 'admin',
          element: <AdminPage currentUser={currentUser ?? null} />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}
