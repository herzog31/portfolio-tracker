// Cache for exchange rates to reduce API calls
// Structure: { [baseCurrency]: { rates: {...}, timestamp: number } }
const ratesCache = {}
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Fetch exchange rates from API
 * @param {string} baseCurrency - Base currency code (default: 'USD')
 * @returns {Promise<Object>} - Object with currency codes as keys and rates as values
 */
export async function fetchExchangeRates(baseCurrency = 'USD') {
  // Check cache first
  const now = Date.now()
  const cachedData = ratesCache[baseCurrency]
  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.rates
  }

  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()

    if (!data.rates) {
      throw new Error('Invalid exchange rate data')
    }

    // Cache the rates for this base currency
    ratesCache[baseCurrency] = {
      rates: data.rates,
      timestamp: now,
    }

    return data.rates
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return {}
  }
}
