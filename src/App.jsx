import { Navbar } from "./components/Navbar";
import { Sidebar } from './components/Sidebar';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ChatWindow from './components/tabs/ChatWindow';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/ai-assistant" element={<ChatWindow />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
