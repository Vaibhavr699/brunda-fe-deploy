import { Suspense, lazy } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useParams } from 'react-router-dom';

const ChatWindow = lazy(() => import('../components/tabs/ChatWindow'));

const Dashboard = () => {
  const params = useParams();
  const activeTab = params['*'] || params?.tab || 'ai-assistant';

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex border-l border-gray-200">
        <Suspense fallback={<LoadingSpinner size={80} />}>
          <ChatWindow activeTab={activeTab} />
        </Suspense>
      </div>
    </div>
  );
};

export default Dashboard;
