import { useState, useEffect } from 'react';
import { Navbar } from "./components/Navbar";
import { Sidebar } from './components/Sidebar';
import Dashboard from './pages/Dashboard';

function App() {
  const COLLAPSE_KEY = 'sidebar_collapsed_v1';
  const [activeTab, setActiveTab] = useState('ai-assistant');

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      return raw ? JSON.parse(raw) : true; // default collapsed
    } catch (e) {
      return true;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsCollapsed((s) => !s);
    } else {
      setIsMobileOpen((s) => !s);
    }
  };

  const closeMobile = () => setIsMobileOpen(false);

  // ✅ persist collapse state
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(isCollapsed));
    } catch (e) {}
  }, [isCollapsed]);

  const renderContent = () => {
    switch (activeTab) {
      case 'ai-assistant':
        return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
      default:
        return <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar
        onToggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        isMobileOpen={isMobileOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          closeMobile={closeMobile}
        />
        <div className="flex-1 overflow-auto">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
