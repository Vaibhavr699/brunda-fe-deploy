import HomeFilledIcon from '@mui/icons-material/HomeFilled';
import PortraitIcon from '@mui/icons-material/Portrait';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AddCallIcon from '@mui/icons-material/AddCall';
import Groups2Icon from '@mui/icons-material/Groups2';
import MessageIcon from '@mui/icons-material/Message';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AddReactionIcon from '@mui/icons-material/AddReaction';
import InsertInvitationIcon from '@mui/icons-material/InsertInvitation';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.replace(/^\//, '') || 'overview';

  const handleKeyActivate = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: HomeFilledIcon },
    { id: 'education-hub', label: 'Education Hub', icon: AutoGraphIcon },
    { id: 'ai-co-founder', label: 'AI Co-founder', icon: PortraitIcon }, 
    { id: 'ai-assistant', label: 'AI Assistant', icon: PortraitIcon }, 
    { id: 'consult-expert', label: 'Consult Expert', icon: AddCallIcon },
    { id: 'hire-freelancer', label: 'Hire Freelancer', icon: Groups2Icon },
    { id: 'messages', label: 'Messages', icon: MessageIcon },
    { id: 'orders', label: 'Orders', icon: ChecklistIcon },
    { id: 'founder-support-directory', label: 'Founder Support Directory', icon: ContactEmergencyIcon },
    { id: 'community', label: 'Community', icon: AddReactionIcon },
    { id: 'events', label: 'Events', icon: InsertInvitationIcon },
    { id: 'account-settings', label: 'Account Settings', icon: SettingsIcon },
    { id: 'logout', label: 'Log out', icon: LogoutIcon },
  ];

  const renderButtons = () =>
    tabs.map((tab) => {
      const Icon = tab.icon;
      const handleClick = () => {
        if (tab.id === 'ai-assistant' || tab.id === 'ai-co-founder') {
          navigate(`/${tab.id}`);
        } else if (tab.id === 'logout') {
          console.log('Logout clicked');
        } else {
          const tabMap = {
            overview: 'overview',
            'education-hub': 'education',
            'consult-expert': 'expert',
            'hire-freelancer': 'freelancers',
            messages: 'messages',
            orders: 'orders',
            'founder-support-directory': 'directory',
            community: 'community',
            events: 'events',
            'account-settings': 'settings',
          };
          window.location.href = `https://dashboard.thentrepreneurlab.com/entrepreneur?tab=${tabMap[tab.id]}`;
        }
      };

      return (
        <div
          key={tab.id}
          className={`flex flex-row items-center justify-start gap-2 rounded-xl py-[5px] px-[29px] pr-8 cursor-pointer min-h-[48px] h-auto w-auto flex-shrink-0 ${
            activeTab === tab.id 
              ? 'bg-[#27368F] text-white' 
              : 'bg-transparent text-[#333333] hover:bg-black/[0.04]'
          }`}
          onClick={handleClick}
          onKeyDown={handleKeyActivate(() => handleClick())}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-center min-w-[20px] max-w-[20px] w-5 min-h-[20px] max-h-[20px] h-5 flex-grow">
            <Icon sx={{ fontSize: 20 }} />
          </div>
          <div className="whitespace-pre-wrap text-[15px] font-normal leading-[1.6] w-max flex-grow-0 font-inter">
            {tab.label}
          </div>
        </div>
      );
    });

  return (
    <div className="flex flex-col bg-[#F4F7FA] overflow-auto border-r border-solid border-[#e0e0e0] p-4 h-full w-[327px] min-w-0">
      <div className="flex flex-col justify-start gap-2 min-w-[40px] h-full w-full">
        {renderButtons()}
      </div>
    </div>
  );
};
