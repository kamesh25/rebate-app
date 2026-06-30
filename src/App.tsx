import { useState } from 'react'
import { loadItems, saveItems, loadRebates, saveRebates, loadTotalSaved, addSavings, isOnboarded, setOnboarded } from './storage'
import type { ReturnItem, RebateItem } from './types'
import { daysLeft, urgency, rebateDaysLeft, rebateUrgency, STORE_POLICIES } from './types'
import AddReturn from './components/AddReturn'
import AddRebate from './components/AddRebate'
import ReturnCard from './components/ReturnCard'
import RebateCard from './components/RebateCard'
import Settings from './components/Settings'
import Onboarding from './components/Onboarding'
import CelebrationSheet from './components/CelebrationSheet'
import { scheduleReturnNotifications, cancelReturnNotifications, sendTestNotification } from './hooks/useNotifications'
import { haptics } from './hooks/useHaptics'
import { loadDemoData } from './demoData'

type Filter = 'all' | 'returns' | 'rebates'
type AddMode = 'none' | 'return' | 'rebate'

export default function App() {
  const [onboarded, setOnboardedState] = useState(isOnboarded)
  const [items, setItems] = useState<ReturnItem[]>(loadItems)
  const [rebates, setRebates] = useState<RebateItem[]>(loadRebates)
  const [totalSaved, setTotalSaved] = useState(loadTotalSaved)
  const [addMode, setAddMode] = useState<AddMode>('none')
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [testMsg, setTestMsg] = useState('')
  const [undoItem, setUndoItem] = useState<ReturnItem | null>(null)
  const [celebration, setCelebration] = useState<{ item: ReturnItem; refund: number; total: number } | null>(null)
  const [notifBanner] = useState(() =>
    typeof Notification !== 'undefined' && Notification.permission === 'denied'
  )
  const [showNotifBanner, setShowNotifBanner] = useState(notifBanner)

  function handleOnboardDone() {
    setOnboarded()
    setOnboardedState(true)
  }

  // --- Returns ---
  async function addItem(item: ReturnItem) {
    const next = [item, ...items]
    setItems(next)
    saveItems(next)
    setAddMode('none')
    haptics.success()
    await scheduleReturnNotifications(item)
  }

  async function markReturned(id: string, refund: number) {
    const returnedItem = items.find(i => i.id === id)
    const next = items.map(i => i.id === id ? { ...i, returned: true, refundAmount: refund } : i)
    setItems(next)
    saveItems(next)
    haptics.success()
    await cancelReturnNotifications(id)
    if (refund > 0) addSavings(refund)
    const newTotal = loadTotalSaved()
    setTotalSaved(newTotal)
    if (returnedItem) setCelebration({ item: returnedItem, refund, total: newTotal })
  }

  async function deleteItem(id: string) {
    const deleted = items.find(i => i.id === id)
    const next = items.filter(i => i.id !== id)
    setItems(next)
    saveItems(next)
    haptics.light()
    await cancelReturnNotifications(id)
    if (deleted) {
      setUndoItem(deleted)
      setTimeout(() => setUndoItem(null), 5000)
    }
  }

  function handleUndo() {
    if (!undoItem) return
    const next = [undoItem, ...items]
    setItems(next)
    saveItems(next)
    scheduleReturnNotifications(undoItem)
    setUndoItem(null)
    haptics.success()
  }

  // --- Rebates ---
  function addRebate(rebate: RebateItem) {
    const next = [rebate, ...rebates]
    setRebates(next)
    saveRebates(next)
    setAddMode('none')
    haptics.success()
  }

  function markRebateSubmitted(id: string) {
    const today = new Date()
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const rebate = rebates.find(r => r.id === id)
    const next = rebates.map(r => r.id === id ? { ...r, submitted: true, submittedDate: dateStr } : r)
    setRebates(next)
    saveRebates(next)
    haptics.success()
    // Add rebate amount to savings tracker
    if (rebate) {
      addSavings(rebate.rebateAmount)
      setTotalSaved(loadTotalSaved())
    }
  }

  function deleteRebate(id: string) {
    const next = rebates.filter(r => r.id !== id)
    setRebates(next)
    saveRebates(next)
    haptics.light()
  }

  async function handleTestNotification() {
    const result = await sendTestNotification()
    if (result === 'sent') setTestMsg('✅ Check back in 10 seconds — background the app!')
    else if (result === 'denied') setTestMsg('❌ Allow notifications in Settings')
    else setTestMsg('❌ Add to Home Screen first for notifications')
    setTimeout(() => setTestMsg(''), 6000)
  }

  if (!onboarded) return <Onboarding onDone={handleOnboardDone} />

  // Build unified sorted list
  const activeReturns = items.filter(i => !i.returned).sort((a, b) => daysLeft(a) - daysLeft(b))
  const doneReturns = items.filter(i => i.returned)
  const activeRebates = rebates.filter(r => !r.submitted).sort((a, b) => rebateDaysLeft(a) - rebateDaysLeft(b))
  const doneRebates = rebates.filter(r => r.submitted)

  const urgentCount =
    activeReturns.filter(i => { const u = urgency(i); return u === 'urgent' || u === 'expired' }).length +
    activeRebates.filter(r => { const u = rebateUrgency(r); return u === 'urgent' || u === 'expired' }).length

  const totalActive = activeReturns.length + activeRebates.length

  return (
    <div className="min-h-screen bg-slate-950 text-white max-w-lg mx-auto px-4 pb-32">

      {/* Header */}
      <div className="pt-10 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ReturnIt 🛍</h1>
            {totalSaved > 0
              ? <p className="text-emerald-400 text-sm font-semibold mt-0.5">Saved ${totalSaved.toFixed(2)} total 💰</p>
              : <p className="text-slate-500 text-sm mt-0.5">Never miss a return or rebate deadline</p>
            }
          </div>
          <div className="flex items-center gap-3">
            {urgentCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                {urgentCount} urgent
              </span>
            )}
            <button onClick={handleTestNotification} className="text-slate-600 hover:text-slate-400 text-xl transition" title="Test notification">🔔</button>
            <button onClick={() => setShowSettings(true)} className="text-slate-600 hover:text-slate-400 text-xl transition">⚙️</button>
          </div>
        </div>

        {testMsg && (
          <p className="text-sm mt-3 text-indigo-300 bg-indigo-950/50 border border-indigo-800/40 rounded-xl px-3 py-2">{testMsg}</p>
        )}
        {showNotifBanner && (
          <div className="flex items-center justify-between mt-3 bg-amber-900/30 border border-amber-700/50 rounded-xl px-3 py-2.5">
            <p className="text-amber-300 text-sm">🔕 Reminders are off — you may miss deadlines</p>
            <button onClick={() => setShowNotifBanner(false)} className="text-amber-500 text-lg leading-none ml-2">×</button>
          </div>
        )}

        {/* Stats */}
        {totalActive > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-5">
            <Stat label="Active" value={totalActive} color="text-white" />
            <Stat label="Expiring soon" value={
              activeReturns.filter(i => { const u = urgency(i); return u === 'soon' || u === 'urgent' }).length +
              activeRebates.filter(r => { const u = rebateUrgency(r); return u === 'soon' || u === 'urgent' }).length
            } color="text-amber-400" />
            <Stat label="Rebates" value={activeRebates.length} color="text-purple-400" />
          </div>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {(['all', 'returns', 'rebates'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-sm font-semibold rounded-xl transition border ${
              filter === f
                ? f === 'rebates' ? 'bg-purple-700 border-purple-600 text-white' : 'bg-white border-white text-black'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            {f === 'all' ? `All (${totalActive})` : f === 'returns' ? `Returns (${activeReturns.length})` : `Rebates (${activeRebates.length})`}
          </button>
        ))}
      </div>

      {/* Lists */}
      {totalActive === 0 && doneReturns.length === 0 && doneRebates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <span className="text-6xl">🛍</span>
          <div>
            <p className="text-white font-semibold text-lg">Track returns & rebates</p>
            <p className="text-slate-500 text-sm mt-1 leading-relaxed">
              Tap + below to add a return deadline<br />or a mail-in rebate. We'll remind you.
            </p>
          </div>
          <button
            onClick={() => { const d = loadDemoData(); setItems(d); saveItems(d) }}
            className="border border-slate-700 text-slate-400 text-sm font-semibold px-5 py-2.5 rounded-xl mt-1 hover:border-slate-500 transition"
          >
            See how it works →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Active returns */}
          {(filter === 'all' || filter === 'returns') && activeReturns.map(item => (
            <ReturnCard
              key={item.id}
              item={item}
              onMarkReturned={(refund) => markReturned(item.id, refund)}
              onDelete={() => deleteItem(item.id)}
            />
          ))}

          {/* Active rebates */}
          {(filter === 'all' || filter === 'rebates') && activeRebates.map(rebate => (
            <RebateCard
              key={rebate.id}
              item={rebate}
              onMarkSubmitted={() => markRebateSubmitted(rebate.id)}
              onDelete={() => deleteRebate(rebate.id)}
            />
          ))}

          {/* Completed section */}
          {filter === 'all' && (doneReturns.length > 0 || doneRebates.length > 0) && (
            <>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide px-1 mt-2">Completed</p>
              {doneReturns.map(item => (
                <ReturnCard key={item.id} item={item} onMarkReturned={(r) => markReturned(item.id, r)} onDelete={() => deleteItem(item.id)} />
              ))}
              {doneRebates.map(rebate => (
                <RebateCard key={rebate.id} item={rebate} onMarkSubmitted={() => markRebateSubmitted(rebate.id)} onDelete={() => deleteRebate(rebate.id)} />
              ))}
            </>
          )}

          {filter === 'returns' && doneReturns.length > 0 && (
            <>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide px-1 mt-2">Returned</p>
              {doneReturns.map(item => (
                <ReturnCard key={item.id} item={item} onMarkReturned={(r) => markReturned(item.id, r)} onDelete={() => deleteItem(item.id)} />
              ))}
            </>
          )}

          {filter === 'rebates' && doneRebates.length > 0 && (
            <>
              <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide px-1 mt-2">Submitted</p>
              {doneRebates.map(rebate => (
                <RebateCard key={rebate.id} item={rebate} onMarkSubmitted={() => markRebateSubmitted(rebate.id)} onDelete={() => deleteRebate(rebate.id)} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Undo toast */}
      {undoItem && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 shadow-xl z-40 whitespace-nowrap">
          <span className="text-slate-300 text-sm">Return deleted</span>
          <button onClick={handleUndo} className="text-indigo-400 font-bold text-sm hover:text-indigo-300 transition">Undo</button>
        </div>
      )}

      {/* Add buttons */}
      {addMode === 'none' ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          <button
            onClick={() => setAddMode('return')}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-6 py-4 rounded-full shadow-xl shadow-indigo-900/50 transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl leading-none">+</span> Return
          </button>
          <button
            onClick={() => setAddMode('rebate')}
            className="bg-purple-700 hover:bg-purple-600 active:scale-95 text-white font-bold px-6 py-4 rounded-full shadow-xl shadow-purple-900/50 transition flex items-center gap-2 whitespace-nowrap"
          >
            <span className="text-xl leading-none">+</span> Rebate
          </button>
        </div>
      ) : null}

      {addMode === 'return' && (
        <AddReturn onAdd={addItem} onClose={() => setAddMode('none')} storePolicies={STORE_POLICIES} />
      )}
      {addMode === 'rebate' && (
        <AddRebate onAdd={addRebate} onClose={() => setAddMode('none')} />
      )}

      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} totalSaved={totalSaved} />
      )}

      {celebration && (
        <CelebrationSheet
          item={celebration.item}
          refund={celebration.refund}
          totalSaved={celebration.total}
          onDone={() => setCelebration(null)}
        />
      )}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-900 rounded-xl px-3 py-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-slate-500 text-sm mt-0.5">{label}</p>
    </div>
  )
}
