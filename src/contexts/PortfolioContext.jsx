import { createContext } from 'preact'
import { useState, useEffect, useContext, useMemo, useCallback } from 'preact/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { useSettings } from '../hooks/useSettings'
import {
  loadPositions,
  savePositions,
  loadStockCache,
  saveStockCache,
  getLatestPrice,
} from '../utils/localStorage'
import { fetchMultipleStocks, fetchStockData } from '../services/eodhdAPI'
import { fetchExchangeRates } from '../services/currencyAPI'
import { convertCurrency } from '../utils/currencyConverter'

dayjs.extend(relativeTime)

const PortfolioContext = createContext()

export function PortfolioProvider({ children }) {
  const { selectedCurrency, apiKey, updateSettings } = useSettings()
  const [positions, setPositions] = useState([])
  const [stockData, setStockData] = useState({})
  const [loading, setLoading] = useState(false)
  const [exchangeRates, setExchangeRates] = useState({})
  const [availableCurrencies, setAvailableCurrencies] = useState([])
  const [lastRefresh, setLastRefresh] = useState(null)

  // Load positions and cached stock data from localStorage on mount
  useEffect(() => {
    const savedPositions = loadPositions()
    setPositions(savedPositions)

    // Build stockData from positions + price cache
    if (savedPositions.length > 0) {
      const dataMap = {}
      const currencies = new Set()
      let latestTimestamp = null

      savedPositions.forEach(position => {
        const latestPrice = getLatestPrice(position.symbol)
        if (latestPrice && position.currency) {
          dataMap[position.id] = {
            success: true,
            symbol: position.symbol,
            name: position.name,
            currency: position.currency,
            exchangeName: position.exchangeName,
            country: position.country,
            type: position.type,
            isin: position.isin,
            price: latestPrice.price,
            timestamp: latestPrice.timestamp,
          }

          currencies.add(position.currency)

          if (!latestTimestamp || latestPrice.timestamp > latestTimestamp) {
            latestTimestamp = latestPrice.timestamp
          }
        }
      })

      if (Object.keys(dataMap).length > 0) {
        setStockData(dataMap)
        setAvailableCurrencies(Array.from(currencies).sort())
        if (latestTimestamp) {
          setLastRefresh(new Date(latestTimestamp))
        }
      }
    }
  }, [])

  // Fetch exchange rates when currencies change or selected currency changes
  useEffect(() => {
    if (availableCurrencies.length === 0) {
      return
    }

    const fetchRates = async () => {
      try {
        const rates = await fetchExchangeRates(selectedCurrency)
        setExchangeRates(rates)
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    }

    fetchRates()
  }, [availableCurrencies, selectedCurrency])

  // Refresh stock data from API
  const refreshPrices = useCallback(async () => {
    if (positions.length === 0) return

    setLoading(true)

    const symbols = positions.map(p => p.symbol)

    // Pass positions as cache to avoid search API calls if metadata exists
    const positionsCache = {}
    positions.forEach(position => {
      if (position.currency) {
        positionsCache[position.symbol] = position
      }
    })

    const results = await fetchMultipleStocks(apiKey, symbols, positionsCache)

    // Update positions with metadata if newly fetched or symbol changed
    const updatedPositions = positions.map((position, index) => {
      const result = results[index]
      if (result.success) {
        // Always update symbol if API returns a different one
        const updates = {}
        if (result.symbol !== position.symbol) {
          updates.symbol = result.symbol
        }
        // Update metadata if not present
        if (!position.currency) {
          updates.name = result.name
          updates.currency = result.currency
          updates.exchangeName = result.exchangeName
          updates.country = result.country
          updates.type = result.type
          updates.isin = result.isin
        }
        // Return updated position if there are any updates
        if (Object.keys(updates).length > 0) {
          return { ...position, ...updates }
        }
      }
      return position
    })

    if (JSON.stringify(updatedPositions) !== JSON.stringify(positions)) {
      setPositions(updatedPositions)
      savePositions(updatedPositions)
    }

    // Add new prices to cache
    const cache = loadStockCache()
    results.forEach(result => {
      if (result.success) {
        // Ensure cache[symbol] is an array
        if (!Array.isArray(cache[result.symbol])) {
          cache[result.symbol] = []
        }
        cache[result.symbol].push({
          timestamp: result.timestamp,
          price: result.price,
        })
      }
    })
    saveStockCache(cache)

    // Build stockData for UI
    const dataMapById = {}
    updatedPositions.forEach((position, index) => {
      dataMapById[position.id] = results[index]
    })

    setStockData(dataMapById)
    setLastRefresh(new Date())

    // Extract unique currencies from positions
    const currencies = new Set()
    updatedPositions.forEach(position => {
      if (position.currency) {
        currencies.add(position.currency)
      }
    })

    const currencyArray = Array.from(currencies).sort()
    setAvailableCurrencies(currencyArray)

    // If selected currency is not in available currencies, default to first one or USD
    if (currencyArray.length > 0 && !currencyArray.includes(selectedCurrency)) {
      const newCurrency = currencyArray.includes('USD') ? 'USD' : currencyArray[0]
      updateSettings({ selectedCurrency: newCurrency })
    }

    // Refresh exchange rates
    const rates = await fetchExchangeRates(selectedCurrency)
    setExchangeRates(rates)

    setLoading(false)
  }, [positions, apiKey, selectedCurrency, updateSettings])

  // Add new position
  const addPosition = useCallback(
    async newPosition => {
      // Fetch stock metadata and price first to get the correct symbol
      setLoading(true)
      try {
        const stockDataResult = await fetchStockData(apiKey, newPosition.symbol)

        if (!stockDataResult.success) {
          alert(`Failed to fetch data for ${newPosition.symbol}: ${stockDataResult.error}`)
          setLoading(false)
          return
        }

        // Check if the API-returned symbol already exists
        if (positions.some(p => p.symbol === stockDataResult.symbol)) {
          alert(`Position for ${stockDataResult.symbol} already exists`)
          setLoading(false)
          return
        }

        // Create position with all metadata using the API-returned symbol
        const positionWithId = {
          id: crypto.randomUUID(),
          symbol: stockDataResult.symbol,
          shares: newPosition.shares,
          targetAllocation: newPosition.targetAllocation || 0,
          name: stockDataResult.name,
          currency: stockDataResult.currency,
          exchangeName: stockDataResult.exchangeName,
          country: stockDataResult.country,
          type: stockDataResult.type,
          isin: stockDataResult.isin,
        }

        // Save position
        const updatedPositions = [...positions, positionWithId]
        setPositions(updatedPositions)
        savePositions(updatedPositions)

        // Add price to cache
        const cache = loadStockCache()
        // Ensure cache[symbol] is an array
        if (!Array.isArray(cache[stockDataResult.symbol])) {
          cache[stockDataResult.symbol] = []
        }
        cache[stockDataResult.symbol].push({
          timestamp: stockDataResult.timestamp,
          price: stockDataResult.price,
        })
        saveStockCache(cache)

        // Update stockData in UI
        setStockData(prev => ({
          ...prev,
          [positionWithId.id]: stockDataResult,
        }))

        // Update available currencies
        const currencies = new Set(availableCurrencies)
        const isNewCurrency = !currencies.has(stockDataResult.currency)
        currencies.add(stockDataResult.currency)
        setAvailableCurrencies(Array.from(currencies).sort())

        // Refresh exchange rates if new currency was added
        if (isNewCurrency) {
          const rates = await fetchExchangeRates(selectedCurrency)
          setExchangeRates(rates)
        }

        setLastRefresh(new Date())
      } catch (error) {
        alert(`Error adding position: ${error.message}`)
      }
      setLoading(false)
    },
    [positions, apiKey, availableCurrencies, selectedCurrency]
  )

  // Edit position (shares or targetAllocation)
  const editPosition = useCallback(
    (positionId, updates) => {
      const updatedPositions = positions.map(p => (p.id === positionId ? { ...p, ...updates } : p))
      setPositions(updatedPositions)
      savePositions(updatedPositions)
    },
    [positions]
  )

  // Delete position
  const removePosition = useCallback(
    positionId => {
      const updatedPositions = positions.filter(p => p.id !== positionId)
      setPositions(updatedPositions)
      savePositions(updatedPositions)

      // Remove from stockData
      setStockData(prev => {
        const newData = { ...prev }
        delete newData[positionId]
        return newData
      })
    },
    [positions]
  )

  // Calculate portfolio total first to get the total for percentage calculations
  const portfolioTotal = useMemo(() => {
    return positions.reduce((total, position) => {
      const data = stockData[position.id]
      if (data && data.success) {
        const positionValue = position.shares * data.price
        const convertedValue = convertCurrency(
          positionValue,
          data.currency,
          selectedCurrency,
          exchangeRates
        )
        return total + convertedValue
      }
      return total
    }, 0)
  }, [positions, stockData, selectedCurrency, exchangeRates])

  // Enrich positions with calculated data and sort by symbol
  const enrichedPositions = useMemo(() => {
    return positions
      .map(position => {
        const data = stockData[position.id]

        if (!data || !data.success) {
          return {
            ...position,
            nativePrice: null,
            convertedPrice: null,
            nativeValue: null,
            convertedValue: null,
            percentage: 0,
          }
        }

        const nativePrice = data.price
        const nativeValue = position.shares * nativePrice
        const convertedPrice = convertCurrency(
          nativePrice,
          data.currency,
          selectedCurrency,
          exchangeRates
        )
        const convertedValue = convertCurrency(
          nativeValue,
          data.currency,
          selectedCurrency,
          exchangeRates
        )
        const percentage = portfolioTotal > 0 ? (convertedValue / portfolioTotal) * 100 : 0

        return {
          ...position,
          nativePrice,
          convertedPrice,
          nativeValue,
          convertedValue,
          percentage,
        }
      })
      .sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [positions, stockData, selectedCurrency, exchangeRates, portfolioTotal])

  const lastRefreshFormatted = useMemo(() => {
    if (!lastRefresh) return 'Never'
    return dayjs(lastRefresh).fromNow()
  }, [lastRefresh])

  const value = {
    // Data
    positions: enrichedPositions,
    stockData,
    portfolioTotal,
    availableCurrencies,
    lastRefresh,
    lastRefreshFormatted,
    loading,

    // Actions
    refreshPrices,
    addPosition,
    editPosition,
    removePosition,
  }

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
