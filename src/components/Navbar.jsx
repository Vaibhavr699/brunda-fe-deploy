import { Bell, User } from "lucide-react";

export const Navbar = () => {
  return (
    <div className="bg-[#27368F] text-white flex justify-between items-center p-3">
      <div className="flex items-center gap-4">
        <img
          src="https://57b659e1e9f6d373608832b183450405.cdn.bubble.io/cdn-cgi/image/w=192,h=80,f=auto,dpr=1.25,fit=contain/f1752788320114x975925293105800800/WhatsApp%20Image%202025-07-15%20at%207%2C40%2C16%20PM-Picsart-AiImageEnhancer-Picsart-AiImageEnhancer%20copy.png"
          alt="The Entrepreneur Lab Logo"
          className="h-16 w-auto object-contain cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer p-2 rounded-full hover:bg-white transition-colors group">
          <Bell size={22} className="text-white group-hover:text-[#27368F]" />
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-sm rounded-full h-4 w-4 flex items-center justify-center text-white">
            2
          </span>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Coming soon!
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800"></div>
          </div>
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
