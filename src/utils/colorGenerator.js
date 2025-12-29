/**
 * Generate a color palette for stock visualization
 * Uses a predefined set of distinct, pleasant colors
 */
const COLOR_PALETTE = [
  '#667eea', // Purple-blue
  '#764ba2', // Purple
  '#f093fb', // Pink
  '#4facfe', // Light blue
  '#00f2fe', // Cyan
  '#43e97b', // Green
  '#38f9d7', // Turquoise
  '#fa709a', // Rose
  '#fee140', // Yellow
  '#30cfd0', // Teal
  '#a8edea', // Mint
  '#ff6b6b', // Red
  '#f77062', // Orange-red
  '#f8b500', // Gold
  '#6c5ce7', // Indigo
  '#00b894', // Emerald
  '#0984e3', // Blue
  '#fd79a8', // Light pink
  '#fdcb6e', // Light orange
  '#6c5ce7', // Purple
]

/**
 * Get a color for a stock symbol
 * @param {number} index - Index of the stock in the list
 * @returns {string} - Hex color code
 */
export function getColorForStock(index) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length]
}
