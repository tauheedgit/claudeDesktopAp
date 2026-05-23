import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const STORAGE_KEY = 'opusmax_app_data';

const defaultSettings = {
  apiKey: '',
  baseUrl: 'https://api.opusmax.pro/v1',
  model: 'claude-3-opus-20240229',
  systemPrompt: 'You are Claude, an AI assistant made by Anthropic. You are helpful, harmless, and honest.',
  temperature: 1,
  maxTokens: 4096
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          if (data.conversations.length > 0) {
            setCurrentConversationId(data.conversations[0].id);
          }
        }
      } else {
        // Check old storage key
        const oldKey = localStorage.getItem('opusmax_api_key');
        if (oldKey) {
          setSettings(prev => ({ ...prev, apiKey: oldKey }));
        }
        createNewConversation();
      }
    } catch (e) {
      console.error('Error loading data:', e);
      createNewConversation();
    }
  }, []);

  // Save data on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ conversations, settings }));
    } catch (e) {
      console.error('Error saving data:', e);
    }
  }, [conversations, settings]);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (newSettings.apiKey) {
      localStorage.setItem('opusmax_api_key', newSettings.apiKey);
    }
  }, []);

  const createNewConversation = useCallback(() => {
    const newConv = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(newConv.id);
    return newConv;
  }, []);

  const selectConversation = useCallback((id) => {
    if (conversations.find(c => c.id === id)) {
      setCurrentConversationId(id);
    }
  }, [conversations]);

  const deleteConversation = useCallback((id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (currentConversationId === id) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id);
        } else {
          createNewConversation();
          return filtered;
        }
      }
      return filtered;
    });
  }, [currentConversationId, createNewConversation]);

  const addMessage = useCallback((role, content) => {
    if (!currentConversationId) {
      createNewConversation();
      return;
    }

    const message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date().toISOString()
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        const messages = [...conv.messages, message];
        const title = conv.title === 'New Chat' && messages.length > 0
          ? content.substring(0, 40).trim() + (content.length > 40 ? '...' : '')
          : conv.title;
        return { ...conv, messages, title, updatedAt: new Date().toISOString() };
      }
      return conv;
    }));
  }, [currentConversationId, createNewConversation]);

  const clearCurrentConversation = useCallback(() => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversationId) {
        return { ...conv, messages: [], title: 'New Chat', updatedAt: new Date().toISOString() };
      }
      return conv;
    }));
  }, [currentConversationId]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      conversations,
      currentConversationId,
      currentConversation,
      createNewConversation,
      selectConversation,
      deleteConversation,
      addMessage,
      clearCurrentConversation,
      toggleSidebar,
      isSidebarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};