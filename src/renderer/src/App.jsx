import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Composer from './components/Composer';
import Settings from './components/Settings';
import './styles/global.css';
import './App.css';

const AppContent = () => {
  const { isSidebarOpen, toggleSidebar } = useApp();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="app">
      <Header title="Claude Desktop" onMenuClick={toggleSidebar} />
      <div className="app-body">
        {isSidebarOpen && <Sidebar onSettingsClick={() => setShowSettings(true)} />}
        <div className="main-content">
          <ChatArea />
          <Composer />
        </div>
      </div>
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;