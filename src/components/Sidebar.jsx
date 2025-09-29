import { MessageSquare } from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isCollapsed = true, isMobileOpen = false, closeMobile = () => { } }) => {

  const handleKeyActivate = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const tabs = [
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: MessageSquare,
    },
  ];

  const renderButtons = (closeAfter = false) =>
    tabs.map((tab) => {
      const Icon = tab.icon;
      const handleClick = () => {
        setActiveTab(tab.id);
        if (closeAfter) closeMobile();
      };
      return (
        <button
          key={tab.id}
          className={`flex items-center gap-3 p-3 rounded-md cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${activeTab === tab.id ? 'bg-[#27368F] text-white' : 'hover:bg-gray-100'
            }`}
          onClick={handleClick}
          onKeyDown={handleKeyActivate(() => handleClick())}
          aria-current={activeTab === tab.id}
        >
          <Icon size={20} aria-hidden="true" />
          {(!isCollapsed || isMobileOpen) && <span className="font-medium">{tab.label}</span>}
        </button>
      );
    });

  const desktopSidebar = (
    <div
      className={`hidden md:flex bg-[#e2e9ef] h-full flex-col transition-all duration-300 
        ${isCollapsed
          ? `
          w-18 md:w-20 lg:w-[75px] 
        `
          : `
          w-[160px] md:w-[200px] lg:w-[280px] xl:w-[320px] 
        `
        }`}
    >
      <div className="p-4 flex flex-col  gap-3">{renderButtons(false)}</div>
    </div>
  );

  const mobileOverlay = isMobileOpen ? (
    <div className="fixed inset-0 z-40 md:hidden pointer-events-none">
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
          }`}
        onClick={closeMobile}
        aria-hidden="true"
      />
      <div
        className={`bg-[#e2e9ef] fixed left-0 top-22 h-[calc(100%-4rem)] z-50 flex flex-col transition-transform duration-600 w-60
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex flex-col gap-3">{renderButtons(true)}</div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {desktopSidebar}
      {mobileOverlay}
    </>
  );
};