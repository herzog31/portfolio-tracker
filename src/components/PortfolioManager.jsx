import { useState } from 'preact/hooks'

import { PositionInput } from './PositionInput'
import { PositionTable } from './PositionTable'
import { CurrencySelector } from './CurrencySelector'
import { PortfolioSummary } from './PortfolioSummary'
import { PortfolioPieChart } from './PortfolioPieChart'
import { Settings } from './Settings'
import { usePortfolio } from '../contexts/PortfolioContext'

export function PortfolioManager() {
  const { positions, availableCurrencies, lastRefreshFormatted, loading, refreshPrices } =
    usePortfolio()

  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div>
      <div className="container">
        <div className="header-row">
          <h1>Stock Portfolio Tracker</h1>
          <button className="settings-btn" onClick={() => setSettingsOpen(true)}>
            Settings
          </button>
        </div>

        <PositionInput />

        <div className="controls-row">
          {availableCurrencies.length > 0 && <CurrencySelector currencies={availableCurrencies} />}

          {positions.length > 0 && (
            <div className="refresh-section">
              <button className="refresh-btn" onClick={refreshPrices} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Prices'}
              </button>
              <span className="last-refresh">Last updated: {lastRefreshFormatted}</span>
            </div>
          )}
        </div>

        <PositionTable />
      </div>

      {positions.length > 0 && (
        <>
          <PortfolioSummary />

          <PortfolioPieChart />
        </>
      )}

      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
