import { SettingsProvider } from './hooks/useSettings'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { PortfolioManager } from './components/PortfolioManager'

export function App() {
  return (
    <SettingsProvider>
      <PortfolioProvider>
        <div>
          <PortfolioManager />
        </div>
      </PortfolioProvider>
    </SettingsProvider>
  )
}
