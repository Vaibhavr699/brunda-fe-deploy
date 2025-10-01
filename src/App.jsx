import { useState, useEffect } from 'react';
import { Navbar } from "./components/Navbar";
import { Sidebar } from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChatWindow from './components/tabs/ChatWindow';

function App() {
  const COLLAPSE_KEY = 'sidebar_collapsed';
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_KEY);
      return raw ? JSON.parse(raw) : true;
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
  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, JSON.stringify(isCollapsed));
    } catch (e) {}
  }, [isCollapsed]);

  return (
    <div className="flex flex-col h-screen">
      <Navbar onToggleSidebar={toggleSidebar} isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isCollapsed={isCollapsed} isMobileOpen={isMobileOpen} closeMobile={closeMobile} />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ai-assistant" element={<ChatWindow />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
