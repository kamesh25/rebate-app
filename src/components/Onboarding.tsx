import { useState } from 'react'
import { requestPermission } from '../hooks/useNotifications'

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [requesting, setRequesting] = useState(false)

  async function handleNotifications() {
    setRequesting(true)
    await requestPermission()
    setRequesting(false)
    onDone()
  }

  const steps = [
    {
      icon: '🛍',
      title: 'Never lose money\non a missed return',
      body: 'Track every purchase return deadline in one place. We remind you before time runs out.',
      cta: 'Next',
      action: () => setStep(1),
    },
    {
      icon: '⏰',
      title: 'Get reminded before\nit\'s too late',
      body: 'ReturnIt alerts you 3 days before, 1 day before, and on the last day — so you always make it in time.',
      cta: requesting ? 'Allowing...' : 'Allow Reminders',
      action: handleNotifications,
      secondary: 'Skip for now',
      secondaryAction: onDone,
    },
  ]

  const s = steps[step]

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col items-center justify-between px-6"
      style={{
        paddingTop: 'calc(var(--safe-top) + 2.5rem)',
        paddingBottom: 'calc(var(--safe-bottom) + 2rem)',
      }}
    >
      {/* Progress dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-700'}`} />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center text-center gap-6">
        <div className="text-8xl">{s.icon}</div>
        <h1 className="text-3xl font-bold text-white leading-tight whitespace-pre-line">{s.title}</h1>
        <p className="text-slate-400 text-lg leading-relaxed">{s.body}</p>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={s.action}
          disabled={requesting}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 active:scale-95 text-white font-bold py-4 rounded-2xl text-lg transition"
        >
          {s.cta}
        </button>
        {s.secondary && (
          <button onClick={s.secondaryAction} className="min-h-11 text-slate-500 text-sm">
            {s.secondary}
          </button>
        )}
      </div>
    </div>
  )
}
