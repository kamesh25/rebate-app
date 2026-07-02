import { useEffect, useState } from 'react'
import type { ReturnItem } from '../types'

interface Props {
  item: ReturnItem
  refund: number
  totalSaved: number
  onDone: () => void
}

const CONFETTI = ['💰', '🎉', '✅', '🛍', '💸', '🎊']

export default function CelebrationSheet({ item, refund, totalSaved, onDone }: Props) {
  const [visible, setVisible] = useState(false)
  const [sparks, setSparks] = useState<{ id: number; emoji: string; x: number; delay: number }[]>([])

  useEffect(() => {
    // Slide in
    requestAnimationFrame(() => setVisible(true))
    // Spawn confetti sparks
    setSparks(Array.from({ length: 12 }, (_, i) => ({
      id: i,
      emoji: CONFETTI[i % CONFETTI.length],
      x: 10 + Math.floor((i / 12) * 80),
      delay: i * 80,
    })))
  }, [])

  function handleDone() {
    setVisible(false)
    setTimeout(onDone, 300)
  }

  async function handleShare() {
    const text = refund > 0
      ? `Just saved $${refund.toFixed(2)} returning my ${item.item} from ${item.store} with ReturnIt! 💰 Total saved: $${totalSaved.toFixed(2)} — never miss a return deadline again.`
      : `Just returned my ${item.item} from ${item.store} on time with ReturnIt! 🎉 Never miss a return deadline again.`
    if (navigator.share) {
      await navigator.share({ title: 'ReturnIt', text }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(text).catch(() => {})
      alert('Copied to clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={handleDone}
      />

      {/* Confetti sparks */}
      {sparks.map(s => (
        <span
          key={s.id}
          className="absolute text-2xl pointer-events-none animate-bounce"
          style={{
            left: `${s.x}%`,
            top: visible ? `${10 + (s.id % 4) * 8}%` : '50%',
            animationDelay: `${s.delay}ms`,
            transition: `top 0.6s ease-out ${s.delay}ms, opacity 0.3s ease-out 1.5s`,
            opacity: visible ? 1 : 0,
          }}
        >
          {s.emoji}
        </span>
      ))}

      {/* Sheet */}
      <div
        className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 rounded-t-3xl px-6 pt-8 flex flex-col items-center gap-5 transition-transform duration-300"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'calc(var(--safe-bottom) + 2.5rem)',
        }}
      >
        {/* Handle */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-700 rounded-full" />

        {/* Amount */}
        {refund > 0 ? (
          <>
            <div className="text-6xl mt-2">💰</div>
            <div className="text-center">
              <p className="text-emerald-400 text-5xl font-black tracking-tight">
                +${refund.toFixed(2)}
              </p>
              <p className="text-slate-300 text-base font-semibold mt-1">saved on this return!</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-6xl mt-2">✅</div>
            <div className="text-center">
              <p className="text-white text-2xl font-black">Return logged!</p>
              <p className="text-slate-400 text-sm mt-1">Nice work staying on top of it</p>
            </div>
          </>
        )}

        {/* Item info */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl px-4 py-3 w-full text-center">
          <p className="text-white font-semibold">{item.item}</p>
          <p className="text-slate-400 text-sm">{item.store}</p>
        </div>

        {/* Running total */}
        {totalSaved > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Total saved with ReturnIt:</span>
            <span className="text-emerald-400 font-bold text-sm">${totalSaved.toFixed(2)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full mt-1">
          <button
            onClick={handleShare}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold py-4 rounded-2xl transition text-base flex items-center justify-center gap-2"
          >
            📤 Share the win
          </button>
          <button
            onClick={handleDone}
            className="w-full text-slate-500 font-semibold py-2 transition hover:text-slate-300 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
