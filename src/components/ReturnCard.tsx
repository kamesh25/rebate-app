import { useRef, useState } from 'react'
import type { ReturnItem } from '../types'
import { daysLeft, urgency, parseLocalDate, storeAccent } from '../types'

const URGENCY_STYLES = {
  safe:    { bar: 'bg-emerald-500', badge: 'bg-emerald-900/50 text-emerald-300 border-emerald-700/50', border: 'border-slate-800' },
  soon:    { bar: 'bg-amber-500',   badge: 'bg-amber-900/50 text-amber-300 border-amber-700/50',       border: 'border-amber-800/50' },
  urgent:  { bar: 'bg-red-500',     badge: 'bg-red-900/50 text-red-300 border-red-700/50',             border: 'border-red-800/60' },
  expired: { bar: 'bg-slate-600',   badge: 'bg-slate-800 text-slate-400 border-slate-700',             border: 'border-slate-700' },
}

type Confirm = 'none' | 'returned' | 'delete'

interface Props {
  item: ReturnItem
  onMarkReturned: (refund: number) => void
  onDelete: () => void
  onEdit: () => void
}

export default function ReturnCard({ item, onMarkReturned, onDelete, onEdit }: Props) {
  const [confirm, setConfirm] = useState<Confirm>('none')
  const [refundInput, setRefundInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const days = daysLeft(item)
  const level = urgency(item)
  const styles = URGENCY_STYLES[level]

  const deadlineDate = parseLocalDate(item.purchaseDate)
  deadlineDate.setDate(deadlineDate.getDate() + item.returnDays)
  const deadlineStr = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysLabel = item.returned
    ? '✓ Returned'
    : days < 0  ? `Expired ${Math.abs(days)}d ago`
    : days === 0 ? '🚨 Due today!'
    : days === 1 ? '⚠️ 1 day left'
    : `${days} days left`

  const progress = item.returned
    ? 100
    : Math.max(0, Math.min(100, ((item.returnDays - days) / item.returnDays) * 100))

  function openReturnConfirm() {
    setConfirm('returned')
    setRefundInput('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div
      className={`bg-slate-900 border ${styles.border} rounded-2xl overflow-hidden border-l-4`}
      style={{ borderLeftColor: storeAccent(item.store) }}
    >
      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800">
        <div className={`h-full ${styles.bar} transition-all`} style={{ width: `${progress}%` }} />
      </div>

      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">

          {/* Left — item info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-white text-lg">{item.store}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${styles.badge}`}>
                {daysLabel}
              </span>
            </div>
            <p className="text-slate-300 text-base leading-snug">{item.item}</p>
            <p className="text-slate-500 text-sm mt-1.5">Return by {deadlineStr}</p>
            {item.returned && item.refundAmount != null && item.refundAmount > 0 && (
              <p className="text-emerald-400 text-sm font-semibold mt-1">Got back ${item.refundAmount.toFixed(2)}</p>
            )}
            {item.notes && <p className="text-slate-500 text-sm mt-1 italic">{item.notes}</p>}
            {item.photo && (
              <img
                src={item.photo}
                alt="Receipt"
                className="mt-2 w-16 h-16 object-cover rounded-xl border border-slate-700 cursor-pointer active:opacity-70"
                onClick={() => window.open(item.photo, '_blank')}
              />
            )}
          </div>

          {/* Right — action buttons (hidden during refund entry) */}
          <div className="flex flex-col gap-2 shrink-0">
            {confirm === 'none' && !item.returned && (
              <>
                <button
                  onClick={openReturnConfirm}
                  className="min-h-11 bg-emerald-700 active:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  ✓ Done
                </button>
                <button
                  onClick={onEdit}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm('delete')}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Delete
                </button>
              </>
            )}

            {confirm === 'delete' && (
              <div className="flex flex-col gap-2 items-stretch">
                <p className="text-slate-400 text-xs text-center">Remove this?</p>
                <button onClick={onDelete} className="min-h-11 bg-red-700 active:bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
                  Remove
                </button>
                <button onClick={() => setConfirm('none')} className="min-h-11 text-slate-500 text-sm py-2 text-center">
                  Cancel
                </button>
              </div>
            )}

            {item.returned && confirm === 'none' && (
              <>
                <button
                  onClick={onEdit}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-300 text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm('delete')}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-500 text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Refund entry panel — full width, expands below */}
      {confirm === 'returned' && (
        <div className="border-t border-slate-800 bg-slate-950/60 px-4 py-4 flex flex-col gap-3">
          <div>
            <p className="text-white font-semibold text-sm">How much did you get back?</p>
            <p className="text-slate-500 text-xs mt-0.5">Check your receipt or bank app</p>
          </div>

          <div className="flex items-center bg-slate-800 border border-slate-700 focus-within:border-emerald-500 rounded-xl px-4 py-3 gap-2 transition">
            <span className="text-emerald-400 font-bold text-xl">$</span>
            <input
              ref={inputRef}
              type="number"
              inputMode="decimal"
              value={refundInput}
              onChange={e => setRefundInput(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-white text-2xl font-bold flex-1 focus:outline-none placeholder-slate-600 w-0"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onMarkReturned(parseFloat(refundInput) || 0)}
              className="min-h-11 flex-1 bg-emerald-600 active:bg-emerald-500 text-white font-bold py-3 rounded-xl transition text-sm"
            >
              {parseFloat(refundInput) > 0 ? `Save $${parseFloat(refundInput).toFixed(2)} 💰` : 'Mark returned'}
            </button>
            <button
              onClick={() => setConfirm('none')}
              className="min-h-11 bg-slate-800 text-slate-400 font-semibold px-4 py-3 rounded-xl transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
