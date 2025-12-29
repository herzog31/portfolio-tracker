import { useSettings } from '../hooks/useSettings'

export function CurrencySelector({ currencies }) {
  const { selectedCurrency, updateSettings } = useSettings()

  if (currencies.length === 0) {
    return null
  }

  const handleCurrencyChange = newCurrency => {
    updateSettings({ selectedCurrency: newCurrency })
  }

  return (
    <div className="currency-selector">
      <label htmlFor="currency-select">Display Currency:</label>
      <select
        id="currency-select"
        value={selectedCurrency}
        onChange={e => handleCurrencyChange(e.target.value)}
      >
        {currencies.map(currency => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </div>
  )
}
