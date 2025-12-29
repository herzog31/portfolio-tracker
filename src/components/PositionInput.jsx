import { useState } from 'preact/hooks'
import { usePortfolio } from '../contexts/PortfolioContext'

export function PositionInput() {
  const { addPosition } = usePortfolio()
  const [symbol, setSymbol] = useState('')
  const [shares, setShares] = useState('')
  const [targetAllocation, setTargetAllocation] = useState('')

  const handleSubmit = e => {
    e.preventDefault()

    if (!symbol.trim() || !shares || parseFloat(shares) <= 0) {
      alert('Please enter a valid symbol and number of shares')
      return
    }

    const allocation = targetAllocation ? parseFloat(targetAllocation) : 0

    if (allocation < 0 || allocation > 100) {
      alert('Target allocation must be between 0 and 100%')
      return
    }

    addPosition({
      symbol: symbol.trim().toUpperCase(),
      shares: parseFloat(shares),
      targetAllocation: allocation,
    })

    // Reset form
    setSymbol('')
    setShares('')
    setTargetAllocation('')
  }

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="stock-symbol">Stock Symbol</label>
        <input
          id="stock-symbol"
          type="text"
          placeholder="e.g. VOO, VT"
          value={symbol}
          onInput={e => setSymbol(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="num-shares">Number of Shares</label>
        <input
          id="num-shares"
          type="number"
          placeholder="0.00"
          value={shares}
          step="0.01"
          min="0.01"
          onInput={e => setShares(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="target-allocation">Target Allocation (%)</label>
        <input
          id="target-allocation"
          type="number"
          placeholder="Optional"
          value={targetAllocation}
          step="0.1"
          min="0"
          max="100"
          onInput={e => setTargetAllocation(e.target.value)}
        />
      </div>
      <button type="submit">Add Position</button>
    </form>
  )
}
