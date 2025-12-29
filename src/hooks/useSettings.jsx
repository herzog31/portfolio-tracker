import { createContext } from 'preact'
import { useState, useEffect, useContext, useCallback } from 'preact/hooks'

const STORAGE_KEY = 'portfolio_settings'

function loadSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data
      ? JSON.parse(data)
      : {
          apiKey: '',
          selectedCurrency: 'USD',
        }
  } catch (error) {
    console.error('Error loading settings:', error)
    return {
      apiKey: '',
      selectedCurrency: 'USD',
    }
  }
}

function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettingsToStorage(settings)
  }, [settings])

  const updateSettings = useCallback(updates => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }))
  }, [])

  const value = {
    apiKey: settings.apiKey,
    selectedCurrency: settings.selectedCurrency,
    settings,
    updateSettings,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
