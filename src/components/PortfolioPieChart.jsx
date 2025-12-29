import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts'
import { getColorForStock } from '../utils/colorGenerator'
import { formatCurrency } from '../utils/currencyConverter'
import { usePortfolio } from '../contexts/PortfolioContext'
import { useSettings } from '../hooks/useSettings'

export function PortfolioPieChart() {
  const { positions } = usePortfolio()
  const { selectedCurrency } = useSettings()

  if (!positions || positions.length === 0) {
    return null
  }

  // Prepare target allocation data (include all positions, show 0% if no target set)
  const targetData = positions.map((position, index) => ({
    target: true,
    symbol: position.symbol,
    percentage: parseFloat(position.targetAllocation || 0),
    fill: getColorForStock(index),
  }))

  // Check if any targets are set
  const hasTargets = targetData.some(d => d.percentage > 0)

  // Prepare actual allocation data using enriched position data
  const actualData = positions.map((position, index) => ({
    symbol: position.symbol,
    percentage: parseFloat(position.percentage || 0),
    value: position.convertedValue || 0,
    fill: getColorForStock(index),
  }))

  // Custom tooltip for outer ring (actual)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload

      if (data.target) {
        return (
          <div className="chart-tooltip">
            <p className="chart-tooltip-title">{data.symbol} (Target)</p>
            <p className="chart-tooltip-value">{data.percentage.toFixed(2)}%</p>
          </div>
        )
      }

      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-title">{data.symbol} (Actual)</p>
          <p className="chart-tooltip-value">
            {data.percentage.toFixed(2)}%<br />
            {formatCurrency(data.value, selectedCurrency)}
          </p>
        </div>
      )
    }
    return null
  }

  const RADIAN = Math.PI / 180
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, symbol, fill }) => {
    if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
      return null
    }

    const radius = innerRadius + (outerRadius - innerRadius) + 15
    const ncx = Number(cx)
    const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN)
    const ncy = Number(cy)
    const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > ncx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {symbol}
      </text>
    )
  }

  return (
    <div className="chart-container">
      <h3>Portfolio Distribution</h3>
      <ResponsiveContainer width="100%" minHeight="350px">
        <PieChart>
          {hasTargets && (
            <Pie
              data={targetData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              innerRadius={95}
              outerRadius={110}
              dataKey="percentage"
              nameKey="symbol"
              isAnimationActive={false}
            >
              {targetData.map((entry, index) => (
                <Cell key={`target-${index}`} fill={entry.fill} opacity={0.6} />
              ))}
            </Pie>
          )}

          <Pie
            data={actualData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            innerRadius={hasTargets ? 105 : 80}
            outerRadius={hasTargets ? 145 : 120}
            dataKey="percentage"
            nameKey="symbol"
            isAnimationActive={false}
          >
            {actualData.map((entry, index) => (
              <Cell key={`actual-${index}`} fill={entry.fill} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
