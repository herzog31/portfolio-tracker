/**
 * Search for a stock symbol using EODHD Search API
 * Returns basic information including currency
 * @param {string} apiKey - EODHD API key
 * @param {string} symbol - Stock symbol to search
 * @returns {Promise<Object>} - Search result with currency info
 */
async function searchSymbol(apiKey, symbol) {
  if (!apiKey) {
    throw new Error('No API key configured. Please add your EODHD API key in Settings.')
  }

  try {
    const url = `https://eodhd.com/api/search/${encodeURIComponent(symbol)}?api_token=${apiKey}&limit=1`
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `HTTP ${response.status}: Failed to search symbol`
      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new Error(`Symbol ${symbol} not found`)
    }

    // Return the first (most relevant) result
    return {
      success: true,
      symbol: data[0].Code,
      exchange: data[0].Exchange,
      name: data[0].Name,
      currency: data[0].Currency,
      type: data[0].Type,
      country: data[0].Country,
      isin: data[0].ISIN,
    }
  } catch (error) {
    console.error(`Error searching symbol ${symbol}:`, error)
    throw error
  }
}

/**
 * Fetch latest stock price using EODHD Historical Data API
 * @param {string} symbol - Stock symbol
 * @param {string} exchange - Exchange code
 * @returns {Promise<Object>} - Latest price data
 */
async function fetchLatestPrice(apiKey, symbol, exchange) {
  if (!apiKey) {
    throw new Error('No API key configured. Please add your EODHD API key in Settings.')
  }

  try {
    const ticker = `${symbol}.${exchange}`
    const url = `https://eodhd.com/api/eod/${encodeURIComponent(ticker)}?api_token=${apiKey}&period=d&order=d&fmt=json`

    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `HTTP ${response.status}: Failed to fetch price`
      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new Error(`No price data available for ${ticker}`)
    }

    // Get the most recent data point (first in the array since we ordered by descending date)
    const latestData = data[0]

    return {
      success: true,
      price: latestData.close,
      date: latestData.date,
      open: latestData.open,
      high: latestData.high,
      low: latestData.low,
      volume: latestData.volume,
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}.${exchange}:`, error)
    throw error
  }
}

/**
 * Fetch complete stock data (search + price)
 * @param {string} symbol - Stock symbol
 * @param {Object} cachedMetadata - Optional cached metadata to skip search API call
 * @returns {Promise<Object>} - Complete stock data with price and currency
 */
export async function fetchStockData(apiKey, symbol, cachedMetadata = null) {
  try {
    let searchResult

    // Step 1: Use cached metadata if available, otherwise search for the symbol
    if (cachedMetadata && cachedMetadata.currency && cachedMetadata.exchangeName) {
      searchResult = {
        symbol: cachedMetadata.symbol || symbol,
        exchange: cachedMetadata.exchangeName,
        name: cachedMetadata.name || symbol,
        currency: cachedMetadata.currency,
        type: cachedMetadata.type,
        country: cachedMetadata.country,
        isin: cachedMetadata.isin,
      }
    } else {
      searchResult = await searchSymbol(apiKey, symbol)
    }

    // Step 2: Always fetch latest price (this is what we want to refresh)
    const priceData = await fetchLatestPrice(apiKey, searchResult.symbol, searchResult.exchange)

    // Combine both results
    return {
      success: true,
      symbol: searchResult.symbol,
      name: searchResult.name,
      currency: searchResult.currency,
      exchangeName: searchResult.exchange,
      country: searchResult.country,
      type: searchResult.type,
      price: priceData.price,
      timestamp: new Date(priceData.date).getTime(),
      isin: searchResult.isin,
    }
  } catch (error) {
    console.error(`Error fetching stock ${symbol}:`, error)
    return {
      success: false,
      symbol,
      error: error.message,
    }
  }
}

/**
 * Fetch multiple stocks with delay to avoid rate limiting
 * @param {string[]} symbols - Array of stock symbols
 * @param {Object} cache - Optional cache object mapping symbols to their metadata
 * @returns {Promise<Object[]>} - Array of stock data
 */
export async function fetchMultipleStocks(apiKey, symbols, cache = {}) {
  const results = []

  for (const symbol of symbols) {
    // Pass cached metadata if available to skip search API call
    const cachedMetadata = cache[symbol]
    const data = await fetchStockData(apiKey, symbol, cachedMetadata)
    results.push(data)

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  return results
}
