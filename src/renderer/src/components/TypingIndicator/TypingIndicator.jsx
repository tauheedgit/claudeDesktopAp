import { useEffect, useState } from 'react';
import './TypingIndicator.css';

const TypingIndicator = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="typing-indicator">
      <div className="typing-logo">
        <div className="typing-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </div>
        <div className="typing-pulse" />
      </div>
      <div className="typing-text">
        <span className="thinking">Thinking</span>
        <span className="animated-dots">{dots}</span>
      </div>
    </div>
  );
};

export default TypingIndicator;