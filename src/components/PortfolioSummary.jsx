import { formatCurrency } from '../utils/currencyConverter'
import { usePortfolio } from '../contexts/PortfolioContext'
import { useSettings } from '../hooks/useSettings'

export function PortfolioSummary() {
  const { portfolioTotal, availableCurrencies, positions } = usePortfolio()
  const { selectedCurrency } = useSettings()

  const positionCount = positions.length
  const currencyCount = availableCurrencies.length

  return (
    <div className="summary">
      <h2>Portfolio Summary</h2>
      <div className="total">{formatCurrency(portfolioTotal, selectedCurrency)}</div>
      <div className="breakdown">
        {positionCount} {positionCount === 1 ? 'position' : 'positions'} | {currencyCount}{' '}
        {currencyCount === 1 ? 'currency' : 'currencies'}
      </div>
    </div>
  )
}
