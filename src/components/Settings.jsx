import { useState, useEffect } from 'preact/hooks'
import { useSettings } from '../hooks/useSettings'

export function Settings({ isOpen, onClose }) {
  const { apiKey: currentApiKey, updateSettings } = useSettings()
  const [apiKey, setApiKey] = useState(currentApiKey)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey)
      setSaved(false)
    }
  }, [isOpen, currentApiKey])

  if (!isOpen) return null

  const handleSave = () => {
    updateSettings({ apiKey })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleOverlayClick = e => {
    if (e.target.className === 'settings-overlay') {
      onClose()
    }
  }

  return (
    <div className="settings-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="form-field">
            <label htmlFor="api-key">EODHD API Key</label>
            <input
              id="api-key"
              type="text"
              value={apiKey}
              onInput={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="settings-input"
            />
            <p className="setting-description">
              Get your free API key at{' '}
              <a href="https://eodhd.com/register" target="_blank" rel="noopener noreferrer">
                eodhd.com
              </a>
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button className="save-btn" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
