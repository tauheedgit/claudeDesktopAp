import { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ title, onMenuClick }) => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximized = () => {
      window.electron?.ipcRenderer?.invoke('window-is-maximized').then(setIsMaximized);
    };
    checkMaximized();
  }, []);

  const handleMinimize = () => window.electron?.ipcRenderer?.send('window-minimize');
  const handleMaximize = () => window.electron?.ipcRenderer?.send('window-maximize');
  const handleClose = () => window.electron?.ipcRenderer?.send('window-close');

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="header-title">{title}</span>
      </div>

      <div className="header-controls">
        <button className="window-btn minimize" onClick={handleMinimize}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect y="5" width="12" height="1" fill="currentColor" />
          </svg>
        </button>
        <button className="window-btn maximize" onClick={handleMaximize}>
          {isMaximized ? (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="0" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12">
              <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          )}
        </button>
        <button className="window-btn close" onClick={handleClose}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;