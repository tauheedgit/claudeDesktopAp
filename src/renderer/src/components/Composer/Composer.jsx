import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import './Composer.css';

const API_BASE_URL = 'https://api.opusmax.pro/v1';

const Composer = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage, currentConversation, settings } = useApp();
  const textareaRef = useRef(null);

  useEffect(() => {
    const apiKey = localStorage.getItem('opusmax_api_key') || settings.apiKey;
    if (!apiKey) {
      setTimeout(() => {
        addMessage('assistant', 'Welcome! Please go to Settings and add your API key to start chatting.');
      }, 100);
    }
  }, []);

  const extractResponseText = (data) => {
    if (data.content && Array.isArray(data.content)) {
      return data.content.find(c => c.type === 'text')?.text;
    }
    if (data.text) return data.text;
    if (data.message?.content) return data.message.content;
    if (data.choices?.[0]?.message?.content) return data.choices[0].message.content;
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const apiKey = localStorage.getItem('opusmax_api_key') || settings.apiKey;
    if (!apiKey) {
      addMessage('assistant', 'Please add your API key in Settings first.');
      return;
    }

    setIsLoading(true);
    const userMessage = input.trim();
    addMessage('user', userMessage);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const messages = currentConversation?.messages
        ?.filter(m => m.role !== 'system')
        ?.map(m => ({ role: m.role, content: m.content })) || [];

      messages.push({ role: 'user', content: userMessage });

      console.log('Sending request to:', `${API_BASE_URL}/messages`);

      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: settings.model || 'claude-3-opus-20240229',
          messages: messages,
          max_tokens: settings.maxTokens || 4096
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      const text = extractResponseText(data);

      if (text) {
        addMessage('assistant', text);
      } else {
        addMessage('assistant', JSON.stringify(data));
      }

    } catch (err) {
      console.error('Request error:', err);
      addMessage('assistant', `Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  const apiKey = localStorage.getItem('opusmax_api_key') || settings.apiKey;

  return (
    <div className="composer">
      <form className="composer-form" onSubmit={handleSubmit}>
        <div className="composer-container">
          <textarea
            ref={textareaRef}
            className="composer-input"
            placeholder={apiKey ? "Message Claude..." : "Add API key in Settings..."}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`send-btn ${input.trim() && apiKey ? 'active' : ''}`}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </button>
        </div>
        <p className="composer-hint">Claude can make mistakes.</p>
      </form>
    </div>
  );
};

export default Composer;