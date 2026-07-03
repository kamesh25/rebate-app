import { useState } from 'react'
import { requestPermission } from '../hooks/useNotifications'
import { ClockIcon } from './icons'

const SCHEDULE = [
  { tag: '3d', color: 'bg-slate-800 text-slate-300', title: '3 days before', body: 'Time to plan the trip' },
  { tag: '1d', color: 'bg-amber-900/50 text-amber-300', title: '1 day before', body: 'Last comfortable chance' },
  { tag: '0d', color: 'bg-red-900/50 text-red-300', title: 'Day of deadline', body: "Final call before money's gone" },
]

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    await requestPermission()
    setRequesting(false)
    onDone()
  }

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-8"
      style={{
        paddingTop: 'calc(var(--safe-top) + 2.5rem)',
        paddingBottom: 'calc(var(--safe-bottom) + 2rem)',
      }}
    >
      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
        <ClockIcon className="w-8 h-8 text-amber-400" />
      </div>

      <div className="text-center flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">Never miss a deadline</h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-xs">
          ReturnIt nudges you three times before every return or rebate window closes.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        {SCHEDULE.map(s => (
          <div key={s.tag} className="flex items-center gap-3">
            <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${s.color}`}>
              {s.tag}
            </span>
            <div>
              <p className="text-white font-semibold text-sm">{s.title}</p>
              <p className="text-slate-500 text-sm">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full flex flex-col gap-3">
        <button
          onClick={handleAllow}
          disabled={requesting}
          className="min-h-11 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 active:scale-95 text-white font-bold py-4 rounded-2xl text-lg transition"
        >
          {requesting ? 'Allowing…' : 'Allow reminders'}
        </button>
        <button onClick={onDone} className="min-h-11 text-slate-500 text-sm">
          Not now
        </button>
      </div>
    </div>
  )
}
