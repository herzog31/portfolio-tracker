const STORAGE_KEYS = {
  POSITIONS: 'portfolio_positions',
  STOCK_CACHE: 'stock_data_cache',
}

// Positions (now includes metadata from search API)
export function loadPositions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSITIONS)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading positions:', error)
    return []
  }
}

export function savePositions(positions) {
  try {
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions))
  } catch (error) {
    console.error('Error saving positions:', error)
  }
}

// Stock cache (array of historical prices per symbol)
export function loadStockCache() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STOCK_CACHE)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error loading stock cache:', error)
    return {}
  }
}

export function saveStockCache(cache) {
  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error('Error saving stock cache:', error)
  }
}

// Helper to add a price entry to cache
export function addPriceToCache(symbol, price, timestamp) {
  try {
    const cache = loadStockCache()
    // Ensure cache[symbol] is an array
    if (!Array.isArray(cache[symbol])) {
      cache[symbol] = []
    }
    cache[symbol].push({ timestamp, price })
    saveStockCache(cache)
  } catch (error) {
    console.error('Error adding price to cache:', error)
  }
}

// Helper to get latest price from cache
export function getLatestPrice(symbol) {
  try {
    const cache = loadStockCache()
    const prices = cache[symbol]
    // Ensure prices is an array and has entries
    if (!Array.isArray(prices) || prices.length === 0) {
      return null
    }
    // Return the most recent price entry
    return prices[prices.length - 1]
  } catch (error) {
    console.error('Error getting latest price:', error)
    return null
  }
}
