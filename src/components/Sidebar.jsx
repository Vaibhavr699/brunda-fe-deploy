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
    { id: 'ai-assistant', label: 'AI Assistant', icon: PortraitIcon },
    { id: 'education-hub', label: 'Education Hub', icon: AutoGraphIcon },
    { id: 'consult-expert', label: 'Consult Expert', icon: AddCallIcon },
    { id: 'hire-freelancer', label: 'Hire Freelancer', icon: Groups2Icon },
    { id: 'messages', label: 'Messages', icon: MessageIcon },
    { id: 'orders', label: 'Orders', icon: ChecklistIcon },
    { id: 'founder-support-directory', label: 'Founder Support Directory', icon: ContactEmergencyIcon },
    { id: 'community', label: 'Community', icon: AddReactionIcon },
    { id: 'events', label: 'Events', icon: InsertInvitationIcon },
    { id: 'account-settings', label: 'Account Settings', icon: SettingsIcon },
  ];

  const renderButtons = () =>
    tabs.map((tab) => {
      const Icon = tab.icon;
      const handleClick = () => {
        if (tab.id === 'ai-assistant') {
          navigate(`/${tab.id}`);
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
        <button
          key={tab.id}
          className={`flex items-center gap-3 py-3 px-6 rounded-xl cursor-pointer text-left  ${
            activeTab === tab.id ? 'bg-[#27368F] text-white' : 'hover:bg-gray-100'
          }`}
          onClick={handleClick}
          onKeyDown={handleKeyActivate(() => handleClick())}
        >
          <Icon fontSize="small" />
          <span className="font-dark">{tab.label}</span>
        </button>
      );
    });

  return (
    <div className="hidden md:flex bg-[#F4F7FA] h-full flex-col w-[330px]">
      <div className="p-4 flex flex-col gap-2">{renderButtons()}</div>
    </div>
  );
};
