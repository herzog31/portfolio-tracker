/**
 * Convert amount from one currency to another using exchange rates
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @param {Object} rates - Exchange rates object with currency codes as keys
 * @returns {number} - Converted amount
 */
export function convertCurrency(amount, fromCurrency, toCurrency, rates) {
  if (fromCurrency === toCurrency) {
    return amount
  }

  if (!rates || !rates[fromCurrency] || !rates[toCurrency]) {
    console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`)
    return amount
  }

  // Convert to base currency (usually USD) then to target currency
  const amountInBase = amount / rates[fromCurrency]
  const convertedAmount = amountInBase * rates[toCurrency]

  return convertedAmount
}

/**
 * Format currency value for display
 * @param {number} value - Numeric value to format
 * @param {string} currency - Currency code
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value, currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
