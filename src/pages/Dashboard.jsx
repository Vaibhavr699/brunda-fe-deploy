import { Suspense, lazy } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const ChatWindow = lazy(() => import('../components/tabs/ChatWindow'));

const Dashboard = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex border-l border-gray-200">
        <Suspense fallback={<LoadingSpinner size={80} />}>
          <ChatWindow activeTab={activeTab} setActiveTab={setActiveTab} />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
