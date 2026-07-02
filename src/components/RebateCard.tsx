import { useState } from 'react'
import type { RebateItem } from '../types'
import { rebateDaysLeft, rebateUrgency, parseLocalDate, storeAccent } from '../types'

const COUNTDOWN_STYLES = {
  safe:      'bg-purple-900/40 text-purple-300 border-purple-700/50',
  soon:      'bg-amber-900/50 text-amber-300 border-amber-700/50',
  urgent:    'bg-red-900/50 text-red-300 border-red-700/50',
  expired:   'bg-slate-800 text-slate-400 border-slate-700',
  submitted: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
}

const BAR_STYLES = {
  safe:      'bg-purple-500',
  soon:      'bg-amber-500',
  urgent:    'bg-red-500',
  expired:   'bg-slate-600',
  submitted: 'bg-emerald-500',
}

interface Props {
  item: RebateItem
  onMarkSubmitted: () => void
  onDelete: () => void
  onEdit: () => void
}

export default function RebateCard({ item, onMarkSubmitted, onDelete, onEdit }: Props) {
  const [confirm, setConfirm] = useState<'none' | 'delete'>('none')
  const days = rebateDaysLeft(item)
  const level = rebateUrgency(item)

  const mailByDate = parseLocalDate(item.mailByDate)
  const mailByStr = mailByDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysLabel = item.submitted
    ? `✓ Submitted${item.submittedDate ? ` ${parseLocalDate(item.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`
    : days < 0  ? `Expired ${Math.abs(days)}d ago`
    : days === 0 ? '🚨 Mail today!'
    : days === 1 ? '⚠️ Mail tomorrow!'
    : `${days} days to mail`

  // progress toward mail-by deadline from purchase date
  const totalDays = Math.max(1, Math.ceil(
    (parseLocalDate(item.mailByDate).getTime() - parseLocalDate(item.purchaseDate).getTime()) / 86400000
  ))
  const progress = item.submitted ? 100 : Math.max(0, Math.min(100, ((totalDays - days) / totalDays) * 100))

  return (
    <div
      className="bg-slate-900 border border-purple-900/60 rounded-2xl overflow-hidden border-l-4"
      style={{ borderLeftColor: storeAccent(item.store) }}
    >
      {/* Purple accent bar — always purple, urgency only affects thickness */}
      <div className="h-1.5 bg-slate-800">
        <div className={`h-full ${BAR_STYLES[level]} transition-all`} style={{ width: `${progress}%` }} />
      </div>

      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">

          {/* Left — item info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-white text-lg">{item.store}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-purple-700/60 bg-purple-900/40 text-purple-300 font-semibold">
                REBATE
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${COUNTDOWN_STYLES[level]}`}>
                {daysLabel}
              </span>
            </div>
            <p className="text-slate-300 text-base leading-snug">{item.item}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-slate-500 text-sm">Mail by {mailByStr}</p>
              <p className="text-purple-400 font-bold text-sm">${item.rebateAmount.toFixed(2)}</p>
            </div>
            {item.notes && <p className="text-slate-500 text-sm mt-1 italic">{item.notes}</p>}
            {item.photo && (
              <img
                src={item.photo}
                alt="Rebate form"
                className="mt-2 w-16 h-16 object-cover rounded-xl border border-slate-700 cursor-pointer active:opacity-70"
                onClick={() => window.open(item.photo, '_blank')}
              />
            )}
          </div>

          {/* Right — actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {confirm === 'none' && !item.submitted && (
              <>
                <button
                  onClick={onMarkSubmitted}
                  className="min-h-11 bg-purple-700 active:bg-purple-600 text-white text-sm font-semibold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  ✓ Mailed
                </button>
                <button
                  onClick={onEdit}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-300 text-sm font-semibold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm('delete')}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-400 text-sm font-semibold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Delete
                </button>
              </>
            )}

            {confirm === 'delete' && (
              <div className="flex flex-col gap-2 items-stretch">
                <p className="text-slate-400 text-xs text-center">Remove?</p>
                <button onClick={onDelete} className="min-h-11 bg-red-700 active:bg-red-600 text-white text-sm font-bold px-3 py-2.5 rounded-xl">
                  Remove
                </button>
                <button onClick={() => setConfirm('none')} className="min-h-11 text-slate-500 text-sm py-2 text-center">
                  Cancel
                </button>
              </div>
            )}

            {item.submitted && confirm === 'none' && (
              <>
                <button
                  onClick={onEdit}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-300 text-sm font-semibold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm('delete')}
                  className="min-h-11 bg-slate-800 active:bg-slate-700 text-slate-500 text-sm font-semibold px-3 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
