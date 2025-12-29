# Stock Portfolio Tracker

A modern, lightweight stock portfolio tracker built with Preact and Vite. Track your investments across multiple currencies with real-time price updates and beautiful visualizations.

## Features

- **Real-time Stock Prices**: Fetches current prices from EODHD API with caching
- **Multi-Currency Support**: Automatic currency conversion with live exchange rates
- **Target Allocation**: Set target percentages and track actual vs target allocation
- **Interactive Charts**: Two-level pie chart visualization showing target and actual distribution
- **Inline Editing**: Edit share counts and target allocations directly in the table
- **Persistent Storage**: Saves your portfolio and settings locally in the browser
- **International Markets**: Supports stocks from global exchanges (US, Swiss, etc.)
- **Dark Mode**: Automatic dark mode support based on system preferences
- **Lightweight**: Built with Preact for optimal performance (~3KB)

## Architecture

**Components**: `PortfolioManager` (main) → `PositionInput`, `PositionTable`, `CurrencySelector`, `PortfolioSummary`, `PortfolioPieChart`

**Services**: EODHD API (stock prices) + ExchangeRate API (currency conversion)

**Utilities**: localStorage persistence, currency conversion, color generation

## Quick Start

```bash
npm install         # Install dependencies
npm run dev         # Start dev server at http://localhost:5173
npm run build       # Build for production
```

## Usage

1. Configure your EODHD API key in Settings (one-time setup)
2. Add stock symbols with share counts and optional target allocation percentages
3. View positions with real-time prices in native currencies
4. Select display currency for portfolio total
5. View portfolio distribution with target vs actual allocation in interactive charts
6. Data auto-saves to localStorage

## API Setup

**Stock Data**: Uses EODHD API (free tier available)

- Supports global stocks and exchanges including US, Swiss, and more
- Get your free API key at [eodhd.com/register](https://eodhd.com/register)
- Add the API key in Settings (click the Settings button in the app)

**Quick test** (browser console):

```javascript
localStorage.setItem(
  'portfolio_positions',
  JSON.stringify([
    { id: crypto.randomUUID(), symbol: 'VOO', shares: 10 },
    { id: crypto.randomUUID(), symbol: 'VT', shares: 25 },
  ])
)
location.reload()
```

## Tech Stack

**Frontend**: Preact (3KB) + Vite  
**Charts**: Recharts  
**APIs**: EODHD + ExchangeRate-API  
**Storage**: LocalStorage

## Project Structure

```
src/
├── components/     # UI components (7 files)
├── services/       # API integrations (EODHD, Exchange)
├── utils/          # localStorage, conversion, colors
├── app.jsx         # Root component
└── index.css       # Styling
```

## Browser Support

Modern browsers with ES6+, LocalStorage, Fetch, crypto.randomUUID()

## License

Apache 2.0
