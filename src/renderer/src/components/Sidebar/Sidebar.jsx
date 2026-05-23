import { useApp } from '../../context/AppContext';
import './Sidebar.css';

const Sidebar = ({ onSettingsClick }) => {
  const { conversations, currentConversationId, selectConversation, deleteConversation, createNewConversation } = useApp();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getGroupedConversations = () => {
    const today = [];
    const yesterday = [];
    const older = [];

    conversations.forEach(conv => {
      const date = new Date(conv.updatedAt);
      const now = new Date();
      const diff = now - date;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) today.push(conv);
      else if (days === 1) yesterday.push(conv);
      else older.push(conv);
    });

    return { today, yesterday, older };
  };

  const groups = getGroupedConversations();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={createNewConversation}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          <span>New chat</span>
        </button>
      </div>

      <div className="sidebar-search">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="6" cy="6" r="4" />
          <line x1="9" y1="9" x2="12" y2="12" />
        </svg>
        <input type="text" placeholder="Search conversations..." className="search-input" />
      </div>

      <nav className="sidebar-nav">
        {groups.today.length > 0 && (
          <div className="conversation-group">
            <div className="group-label">Today</div>
            {groups.today.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onSelect={() => selectConversation(conv.id)}
                onDelete={() => deleteConversation(conv.id)}
              />
            ))}
          </div>
        )}

        {groups.yesterday.length > 0 && (
          <div className="conversation-group">
            <div className="group-label">Yesterday</div>
            {groups.yesterday.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onSelect={() => selectConversation(conv.id)}
                onDelete={() => deleteConversation(conv.id)}
              />
            ))}
          </div>
        )}

        {groups.older.length > 0 && (
          <div className="conversation-group">
            <div className="group-label">Previous 7 Days</div>
            {groups.older.map(conv => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === currentConversationId}
                onSelect={() => selectConversation(conv.id)}
                onDelete={() => deleteConversation(conv.id)}
              />
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onSettingsClick}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="9" r="2.5" />
            <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" />
          </svg>
          Settings
        </button>

        <div className="user-profile">
          <div className="user-avatar">U</div>
          <span className="user-name">User</span>
        </div>
      </div>
    </aside>
  );
};

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => (
  <div className={`conversation-item ${isActive ? 'active' : ''}`}>
    <button className="conversation-btn" onClick={onSelect}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 2a1 1 0 011-1h8a1 1 0 011 1v8a1 1 0 01-1 1H4l-3 2V2z" />
      </svg>
      <span className="conversation-title">{conversation.title}</span>
    </button>
    <button className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="2" y1="2" x2="10" y2="10" />
        <line x1="10" y1="2" x2="2" y2="10" />
      </svg>
    </button>
  </div>
);

export default Sidebar;