import { Bell } from "react-feather";

export const Navbar = () => {
  return (
    <div className="bg-[#27368F] text-white flex justify-between items-center px-4 py-3 overflow-x-auto">
      {/* Left: Logo */}
      <div className="flex items-center flex-shrink-0">
        <img
          src="https://57b659e1e9f6d373608832b183450405.cdn.bubble.io/cdn-cgi/image/w=192,h=80,f=auto,dpr=1.25,fit=contain/f1752788320114x975925293105800800/WhatsApp%20Image%202025-07-15%20at%207%2C40%2C16%20PM-Picsart-AiImageEnhancer-Picsart-AiImageEnhancer%20copy.png"
          alt="The Entrepreneur Lab Logo"
          className="w-[150px] h-auto object-contain cursor-pointer"
        />
      </div>

      {/* Right: Bell Icon, Profile Name, Profile Image */}
      <div className="flex items-center gap-[10px] flex-shrink-0">
        {/* Bell Icon with Badge */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "40px", height: "40px" }}
        >
          <button
            className="flex items-center justify-center rounded-full hover:bg-white hover:-[#27368F] transition-all duration-200 cursor-pointer bg-transparent border-0"
            style={{ width: "34px", height: "34px" }}
          >
            <Bell
              size={20}
              color="white"
              aria-label="Notifications"
            />
          </button>
          <div
            className="absolute bg-[#EF2F15] text-white text-[8px] font-semibold rounded-full flex items-center justify-center border border-gray-400 border-width-1 leading-none"
            style={{
              width: "18px",
              height: "18px",
              top: "2px",
              right: "2px",
              lineHeight: "1.4",
            }}
          >
            2
          </div>
        </div>

        {/* Profile Name */}
        <div
          className="flex flex-col justify-center gap-0"
          style={{ minWidth: "40px", minHeight: "40px" }}
        >
          <p
            className="text-[16px] font-medium text-white text-right whitespace-nowrap"
            style={{ lineHeight: "1.6", fontWeight: "400" }}
          >
            Brunda
          </p>
          <p
            className="text-[12px] text-white text-right whitespace-nowrap opacity-75"
            style={{ lineHeight: "1", fontWeight: "400" }}
          >
            Entrepreneur
          </p>
        </div>

        {/* Profile Image */}
        <div
          className="rounded-full border border-white cursor-pointer flex items-center justify-center overflow-hidden"
          style={{
            width: "38px",
            height: "38px",
          }}
        >
          <img
            src="https://57b659e1e9f6d373608832b183450405.cdn.bubble.io/f1752782370428x517428081080854300/user.svg"
            alt="User Profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>
    </div>
  );
};
