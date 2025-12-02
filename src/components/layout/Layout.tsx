import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useState } from 'react';

interface LayoutProps {
  currentUser?: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export function Layout({ currentUser, onLoginClick, onLogoutClick }: LayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  
  // 根据当前路径确定activeSection
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return 'home';
    if (path === '/favorites') return 'favorites';
    if (path === '/browsing-history') return 'browsing';
    if (path === '/3d-artifacts') return '3d-artifacts';
    if (path === '/ai-assistant') return 'ai-assistant';
    if (path === '/map-exploration') return 'map-exploration';
    if (path === '/about') return 'about';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const activeSection = getActiveSection();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeSection={activeSection}
        className="w-64 border-r hidden md:block"
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onSearch={handleSearch} 
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
          currentUser={currentUser}
        />
        
        <main className="flex-1 overflow-auto">
          <Outlet context={{ searchQuery }} />
        </main>
      </div>
    </div>
  );
}
