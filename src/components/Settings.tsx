import { STORE_POLICIES } from '../types'

export default function Settings({ onClose, totalSaved }: { onClose: () => void; totalSaved: number }) {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto px-4" style={{ paddingBottom: 'max(3rem, calc(env(safe-area-inset-bottom) + 2rem))' }}>
        {/* Header */}
        <div
          className="flex items-center justify-between pb-6"
          style={{ paddingTop: 'max(3rem, calc(env(safe-area-inset-top) + 0.75rem))' }}
        >
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <button onClick={onClose} className="min-h-11 px-2 flex items-center text-slate-400 hover:text-white text-sm font-semibold transition">Done</button>
        </div>

        {/* Savings card */}
        <div className="bg-gradient-to-br from-indigo-900/60 to-emerald-900/40 border border-indigo-700/40 rounded-2xl p-5 mb-5 text-center">
          <p className="text-slate-400 text-sm">Total saved by returning on time</p>
          <p className="text-4xl font-bold text-white mt-1">${totalSaved.toFixed(2)}</p>
          <p className="text-slate-500 text-xs mt-2">Every dollar counts 💪</p>
        </div>

        {/* Notification info */}
        <Section title="Notifications">
          <Row icon="🔔" label="3 days before deadline" value="On" />
          <Row icon="⚠️" label="1 day before deadline" value="On" />
          <Row icon="🚨" label="Day of deadline" value="9:00 AM" />
          <div className="px-4 py-3">
            <p className="text-slate-600 text-xs leading-relaxed">
              To change notification times, go to iPhone Settings → Notifications → ReturnIt
            </p>
          </div>
        </Section>

        {/* Store return policies */}
        <Section title="Store Return Policies">
          {STORE_POLICIES.filter(p => p.store !== 'Other').map(p => (
            <Row key={p.store} label={p.store} value={`${p.days} days`} />
          ))}
          <div className="px-4 py-3">
            <p className="text-slate-600 text-xs leading-relaxed">
              Policies are estimates. Always check your receipt for the exact return window.
            </p>
          </div>
        </Section>

        {/* Share */}
        <Section title="Spread the Word">
          <Row icon="📤" label="Share ReturnIt" value="→" onTap={() => {
            if (navigator.share) {
              navigator.share({ title: 'ReturnIt', text: 'I use this app to track return deadlines so I never lose money — it\'s free!', url: 'https://returnit.app' })
            }
          }} />
        </Section>

        {/* About */}
        <Section title="About">
          <Row icon="🔒" label="Privacy Policy" value="→" onTap={() => window.open('https://returnit-theta.vercel.app/privacy', '_blank')} />
          <Row label="Version" value="1.0.0" />
        </Section>

        <p className="text-slate-700 text-xs text-center mt-6">
          Made with ❤️ to keep money in your pocket
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide px-1 mb-2">{title}</p>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        {children}
      </div>
    </div>
  )
}

function Row({ icon, label, value, onTap }: { icon?: string; label: string; value: string; onTap?: () => void }) {
  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      className="w-full flex items-center justify-between px-4 py-3.5 text-left disabled:cursor-default active:bg-slate-800 transition"
    >
      <span className="text-white text-sm flex items-center gap-2.5">
        {icon && <span>{icon}</span>}
        {label}
      </span>
      <span className="text-slate-500 text-sm">{value}</span>
    </button>
  )
}
