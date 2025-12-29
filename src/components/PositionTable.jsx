import { useState } from 'preact/hooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { formatCurrency } from '../utils/currencyConverter'
import { usePortfolio } from '../contexts/PortfolioContext'

dayjs.extend(relativeTime)

export function PositionTable() {
  const { positions, stockData, loading, editPosition, removePosition } = usePortfolio()
  const [editingSharesId, setEditingSharesId] = useState(null)
  const [editingTargetId, setEditingTargetId] = useState(null)
  const [editShares, setEditShares] = useState('')
  const [editTarget, setEditTarget] = useState('')

  if (positions.length === 0) {
    return (
      <div className="empty-state">
        <h3>No positions yet</h3>
        <p>Add your first stock position to get started</p>
      </div>
    )
  }

  const handleSharesClick = position => {
    setEditingSharesId(position.id)
    setEditShares(position.shares.toString())
  }

  const handleTargetClick = position => {
    setEditingTargetId(position.id)
    setEditTarget((position.targetAllocation || 0).toString())
  }

  const handleSharesBlur = positionId => {
    const shares = parseFloat(editShares)
    if (shares && shares > 0) {
      editPosition(positionId, { shares })
    }
    setEditingSharesId(null)
    setEditShares('')
  }

  const handleTargetBlur = positionId => {
    const target = parseFloat(editTarget)
    if (target >= 0 && target <= 100) {
      editPosition(positionId, { targetAllocation: target })
    }
    setEditingTargetId(null)
    setEditTarget('')
  }

  const handleKeyDown = (e, positionId, type) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'Escape') {
      if (type === 'shares') {
        setEditingSharesId(null)
        setEditShares('')
      } else {
        setEditingTargetId(null)
        setEditTarget('')
      }
    }
  }

  const formatTimestamp = timestamp => {
    if (!timestamp) return 'N/A'
    return dayjs(timestamp).fromNow()
  }

  return (
    <div>
      {loading && (
        <div className="loading">
          <span className="spinner"></span> Loading stock prices...
        </div>
      )}
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Shares</th>
            <th>Price</th>
            <th>Total Value</th>
            <th>Target %</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(position => {
            const data = stockData[position.id]
            const hasData = data && data.success
            const isEditingShares = editingSharesId === position.id
            const isEditingTarget = editingTargetId === position.id
            const displayShares = isEditingShares
              ? parseFloat(editShares) || position.shares
              : position.shares
            const totalValue = hasData ? displayShares * data.price : 0
            const targetAllocation = position.targetAllocation || 0

            return (
              <tr key={position.id}>
                <td>
                  <div>
                    <strong>{position.symbol}</strong>
                  </div>
                  {position.exchangeName && (
                    <div className="timestamp">{position.exchangeName}</div>
                  )}
                  {data && !data.success && (
                    <div className="error" style={{ fontSize: '11px', marginTop: '4px' }}>
                      {data.error || 'Failed to load'}
                    </div>
                  )}
                </td>
                <td
                  onClick={() => !isEditingShares && handleSharesClick(position)}
                  style={{ cursor: 'pointer' }}
                >
                  {isEditingShares ? (
                    <input
                      type="number"
                      value={editShares}
                      onInput={e => setEditShares(e.target.value)}
                      onBlur={() => handleSharesBlur(position.id)}
                      onKeyDown={e => handleKeyDown(e, position.id, 'shares')}
                      step="0.01"
                      min="0.01"
                      className="inline-edit-input"
                      autoFocus
                    />
                  ) : (
                    <span className="editable-field">{position.shares.toFixed(2)}</span>
                  )}
                </td>
                <td>
                  {hasData ? (
                    <div>
                      <div>
                        <span className={`currency-badge currency-${data.currency}`}>
                          {data.currency}
                        </span>{' '}
                        {data.price.toFixed(2)}
                      </div>
                      <span
                        className="timestamp"
                        title={data?.timestamp ? new Date(data.timestamp).toLocaleString() : ''}
                      >
                        {formatTimestamp(data.timestamp)}
                      </span>
                    </div>
                  ) : loading ? (
                    '...'
                  ) : (
                    'N/A'
                  )}
                </td>
                <td>
                  {hasData ? (
                    <strong>{formatCurrency(totalValue, data.currency)}</strong>
                  ) : loading ? (
                    '...'
                  ) : (
                    'N/A'
                  )}
                </td>
                <td
                  onClick={() => !isEditingTarget && handleTargetClick(position)}
                  style={{ cursor: 'pointer' }}
                >
                  {isEditingTarget ? (
                    <input
                      type="number"
                      value={editTarget}
                      onInput={e => setEditTarget(e.target.value)}
                      onBlur={() => handleTargetBlur(position.id)}
                      onKeyDown={e => handleKeyDown(e, position.id, 'target')}
                      step="0.1"
                      min="0"
                      max="100"
                      className="inline-edit-input"
                      autoFocus
                    />
                  ) : (
                    <span className="editable-field">{targetAllocation.toFixed(1)}%</span>
                  )}
                </td>
                <td>
                  <button className="delete-btn" onClick={() => removePosition(position.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
