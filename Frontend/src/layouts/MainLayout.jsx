import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen">
      <div className="relative">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          sidebarMinimized={sidebarMinimized}
          sidebarOpen={sidebarOpen}
        />

        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          isMinimized={sidebarMinimized}
          onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        />

        <main className={`p-4 sm:p-6 lg:p-8 transition-all duration-300 ease-in-out ${
          sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

