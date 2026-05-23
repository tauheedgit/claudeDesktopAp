import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { jsPDF } from 'jspdf';
import './ChatArea.css';

const TypingIndicator = () => (
  <div className="typing-message">
    <div className="message-avatar">
      <div className="avatar claude-avatar">C</div>
    </div>
    <div className="message-content">
      <div className="typing-bubble">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
      <span className="typing-label">Thinking...</span>
    </div>
  </div>
);

const ChatArea = () => {
  const { currentConversation, clearCurrentConversation, addMessage, settings } = useApp();
  const [copyingId, setCopyingId] = useState(null);
  const chatRef = useRef(null);

  const messages = currentConversation?.messages || [];

  const copyMessage = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyingId(id);
      setTimeout(() => setCopyingId(null), 2000);
    } catch (err) {
      console.error('Failed to copy');
    }
  };

  const exportAsText = () => {
    if (!currentConversation || messages.length === 0) return;

    let content = `Chat Export - ${currentConversation.title}\n`;
    content += `Date: ${new Date(currentConversation.createdAt).toLocaleString()}\n`;
    content += '═'.repeat(50) + '\n\n';

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'YOU' : 'CLAUDE';
      content += `[${role}]\n${msg.content}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentConversation.title}.txt`;
    a.click();
  };

  const exportAsPDF = () => {
    if (!currentConversation || messages.length === 0) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text(currentConversation.title, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(new Date().toLocaleString(), 20, y);
    y += 15;

    messages.forEach((msg) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(msg.role === 'user' ? 0 : 100);
      doc.text(msg.role === 'user' ? 'YOU' : 'CLAUDE', 20, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      const lines = doc.splitTextToSize(msg.content, 170);
      lines.forEach(line => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, 20, y);
        y += 5;
      });
      y += 8;
    });

    doc.save(`${currentConversation.title}.pdf`);
  };

  const exportAsImage = () => {
    if (!chatRef.current) return;
    html2canvas(chatRef.current, { backgroundColor: '#ffffff', scale: 2 })
      .then(canvas => {
        const a = document.createElement('a');
        a.download = `${currentConversation.title}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
  };

  return (
    <div className="chat-area">
      <div className="chat-header">
        <div className="chat-info">
          <h2>{currentConversation?.title || 'New Chat'}</h2>
          <span className="message-count">{messages.length} messages</span>
        </div>
        <div className="chat-actions">
          <button className="export-btn" onClick={exportAsText} title="Export TXT">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h6a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
              <path d="M5 5h4M5 7h4M5 9h2" />
            </svg>
            TXT
          </button>
          <button className="export-btn" onClick={exportAsPDF} title="Export PDF">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h6a1 1 0 011 1v8a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" />
              <text x="4" y="9" fontSize="5" fill="currentColor" stroke="none">PDF</text>
            </svg>
            PDF
          </button>
          <button className="export-btn" onClick={exportAsImage} title="Export Image">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="2" width="12" height="10" rx="1" />
              <circle cx="4" cy="5" r="1" />
              <path d="M1 9l3-3 2 2 4-4 3 4" />
            </svg>
            Image
          </button>
          <button className="export-btn danger" onClick={() => confirm('Clear chat?') && clearCurrentConversation()} title="Clear">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h10M4 4V3a1 1 0 011-1h4a1 1 0 011 1v1M5 6v5M9 6v5M2 4l1 8a1 1 0 001 1h6a1 1 0 001-1l1-8" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div className="chat-messages" ref={chatRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 8a4 4 0 014-4h28a4 4 0 014 4v24a4 4 0 01-4 4H18l-10 8V8z" />
              </svg>
            </div>
            <h3>Start a conversation</h3>
            <p>Ask me anything!</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="message-avatar">
              <div className={`avatar ${msg.role === 'user' ? 'user-avatar' : 'claude-avatar'}`}>
                {msg.role === 'user' ? 'U' : 'C'}
              </div>
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              <div className="message-footer">
                <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button className="copy-btn" onClick={() => copyMessage(msg.content, msg.id)}>
                  {copyingId === msg.id ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatArea;