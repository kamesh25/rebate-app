import { useState } from 'react'
import type { RebateItem } from '../types'
import { rebateDaysLeft, rebateUrgency, parseLocalDate } from '../types'
import { MoreIcon } from './icons'
import CardMoreMenu from './CardMoreMenu'

const COUNTDOWN_STYLES = {
  safe:      { badge: 'bg-purple-900/40 text-purple-300 border-purple-700/50',  border: 'border-l-purple-500' },
  soon:      { badge: 'bg-amber-900/50 text-amber-300 border-amber-700/50',     border: 'border-l-amber-500' },
  urgent:    { badge: 'bg-red-900/50 text-red-300 border-red-700/50',          border: 'border-l-red-500' },
  expired:   { badge: 'bg-slate-800 text-slate-400 border-slate-700',          border: 'border-l-slate-600' },
  submitted: { badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50', border: 'border-l-emerald-600' },
}

interface Props {
  item: RebateItem
  onMarkSubmitted: () => void
  onDelete: () => void
  onEdit: () => void
}

export default function RebateCard({ item, onMarkSubmitted, onDelete, onEdit }: Props) {
  const [confirm, setConfirm] = useState<'none' | 'delete'>('none')
  const [showMore, setShowMore] = useState(false)
  const days = rebateDaysLeft(item)
  const level = rebateUrgency(item)
  const styles = COUNTDOWN_STYLES[level]

  const mailByDate = parseLocalDate(item.mailByDate)
  const mailByStr = mailByDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const daysLabel = item.submitted
    ? `Submitted${item.submittedDate ? ` ${parseLocalDate(item.submittedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}`
    : days < 0  ? `Expired ${Math.abs(days)}d ago`
    : days === 0 ? 'Mail today'
    : days === 1 ? 'Mail tomorrow'
    : `${days} days to mail`

  return (
    <div className={`bg-slate-900 border border-slate-800 ${styles.border} border-l-4 rounded-2xl overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">

          {/* Left — item info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-white text-lg">{item.store}</span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-purple-700/60 bg-purple-900/40 text-purple-300 font-semibold">
                Rebate
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${styles.badge}`}>
                {daysLabel}
              </span>
            </div>
            <p className="text-slate-300 text-base leading-snug">{item.item}</p>
            <p className="text-slate-400 text-sm mt-1.5">
              Mail by {mailByStr} · ${item.rebateAmount.toFixed(2)}
            </p>
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
          {confirm === 'none' && (
            <div className="flex items-center gap-2 shrink-0">
              {!item.submitted && (
                <button
                  onClick={onMarkSubmitted}
                  className="min-h-11 bg-purple-700 active:bg-purple-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition whitespace-nowrap"
                >
                  Mailed
                </button>
              )}
              <button
                onClick={() => setShowMore(true)}
                className="min-h-11 min-w-11 flex items-center justify-center bg-slate-800 active:bg-slate-700 text-slate-400 rounded-xl transition"
                aria-label="More options"
              >
                <MoreIcon className="w-5 h-5" />
              </button>
            </div>
          )}

          {confirm === 'delete' && (
            <div className="flex flex-col gap-2 items-stretch shrink-0">
              <p className="text-slate-400 text-xs text-center">Remove?</p>
              <button onClick={onDelete} className="min-h-11 bg-red-700 active:bg-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl">
                Remove
              </button>
              <button onClick={() => setConfirm('none')} className="min-h-11 text-slate-500 text-sm py-2 text-center">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <CardMoreMenu
        open={showMore}
        onClose={() => setShowMore(false)}
        onEdit={onEdit}
        onDelete={() => setConfirm('delete')}
      />
    </div>
  )
}
