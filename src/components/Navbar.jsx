import { useEffect, useState } from 'react';
import { Bell, User, Menu, X } from "lucide-react";

export const Navbar = ({ onToggleSidebar, isCollapsed = true, isMobileOpen = false }) => {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const showClose = isDesktop ? !isCollapsed : isMobileOpen;

  return (
    <div className="bg-[#27368F] text-white flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <button
          className="p-2 mr-2 text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white border border-white cursor-pointer"
          onClick={onToggleSidebar}
        >
          {showClose ? <X size={22} /> : <Menu size={22} />}
        </button>
        <img
          src="https://57b659e1e9f6d373608832b183450405.cdn.bubble.io/cdn-cgi/image/w=192,h=80,f=auto,dpr=1.25,fit=contain/f1752788320114x975925293105800800/WhatsApp%20Image%202025-07-15%20at%207%2C40%2C16%20PM-Picsart-AiImageEnhancer-Picsart-AiImageEnhancer%20copy.png"
          alt="The Entrepreneur Lab Logo"
          className="h-16 w-auto object-contain cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-sm rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <p className="text-md font-medium">Brunda</p>
            <p className="text-sm opacity-75">Entrepreneur</p>
          </div>
          <div className="bg-gray-300 rounded-full p-1 cursor-pointer">
            <User size={28} className="text-[#27368F]" />
          </div>
        </div>
      </div>
    </div>
  );
};
