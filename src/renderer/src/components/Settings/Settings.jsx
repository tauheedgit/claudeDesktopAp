import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Settings.css';

const Settings = ({ onClose }) => {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    if (localSettings.apiKey) {
      localStorage.setItem('opusmax_api_key', localSettings.apiKey);
    }
    updateSettings(localSettings);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleTest = async () => {
    if (!localSettings.apiKey) {
      setTestResult({ success: false, message: 'Please enter an API key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Use IPC to bypass CORS
      const result = await window.electron.ipcRenderer.invoke('api-call', '/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localSettings.apiKey}`
        },
        body: {
          model: localSettings.model,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 10
        }
      });

      if (result.ok) {
        setTestResult({ success: true, message: 'API key is valid! Connection successful.' });
      } else {
        setTestResult({ success: false, message: result.data?.error?.message || `Error: ${result.status}` });
      }
    } catch (err) {
      setTestResult({ success: false, message: `Connection failed: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="settings-overlay" onClick={handleCancel}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={handleCancel}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M4.5 4.5L15.5 15.5M15.5 4.5L4.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="settings-content">
          <div className="setting-section">
            <h3>API Configuration</h3>

            <div className="setting-group">
              <label>API Base URL</label>
              <input
                type="text"
                value={localSettings.baseUrl}
                onChange={(e) => setLocalSettings(s => ({ ...s, baseUrl: e.target.value }))}
              />
              <span className="setting-hint">API endpoint URL</span>
            </div>

            <div className="setting-group">
              <label>API Key</label>
              <input
                type="password"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings(s => ({ ...s, apiKey: e.target.value }))}
                placeholder="Enter your API key..."
              />
              <span className="setting-hint">Your API key is stored locally</span>
            </div>
          </div>

          <div className="setting-section">
            <h3>Model Settings</h3>

            <div className="setting-group">
              <label>Model</label>
              <select
                value={localSettings.model}
                onChange={(e) => setLocalSettings(s => ({ ...s, model: e.target.value }))}
              >
                <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
              </select>
            </div>

            <div className="setting-group">
              <label>System Prompt</label>
              <textarea
                value={localSettings.systemPrompt}
                onChange={(e) => setLocalSettings(s => ({ ...s, systemPrompt: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="setting-row">
              <div className="setting-group">
                <label>Temperature: {localSettings.temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => setLocalSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                />
              </div>

              <div className="setting-group">
                <label>Max Tokens: {localSettings.maxTokens}</label>
                <input
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={localSettings.maxTokens}
                  onChange={(e) => setLocalSettings(s => ({ ...s, maxTokens: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </div>

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={handleTest} disabled={isTesting}>
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          <div className="footer-right">
            <button className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;