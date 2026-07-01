import { useState } from 'react'
import type { ReturnItem } from '../types'
import { STORE_POLICIES, todayString, parseLocalDate } from '../types'
import { takeReceiptPhoto, pickReceiptPhoto } from '../hooks/useCamera'
import { Capacitor } from '@capacitor/core'

interface Props {
  onAdd: (item: ReturnItem) => void
  onClose: () => void
  storePolicies: typeof STORE_POLICIES
}

export default function AddReturn({ onAdd, onClose }: Props) {
  const today = todayString()
  const [store, setStore] = useState('')
  const [customStore, setCustomStore] = useState('')
  const [item, setItem] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(today)
  const [customDays, setCustomDays] = useState('30')
  const [notes, setNotes] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)
  const [photoLoading, setPhotoLoading] = useState(false)

  async function handleTakePhoto() {
    setPhotoLoading(true)
    const result = await takeReceiptPhoto()
    if (result) setPhoto(result)
    setPhotoLoading(false)
  }

  async function handlePickPhoto() {
    setPhotoLoading(true)
    const result = await pickReceiptPhoto()
    if (result) setPhoto(result)
    setPhotoLoading(false)
  }

  function handleStoreChange(s: string) {
    setStore(s)
    const policy = STORE_POLICIES.find(p => p.store === s)
    if (policy) setCustomDays(String(policy.days))
  }

  function handleSubmit() {
    const storeName = store === 'Other' ? customStore.trim() : store
    if (!storeName || !item.trim()) return
    const days = parseInt(customDays)
    if (!days || days < 1) return

    const deadline = new Date(purchaseDate)
    deadline.setDate(deadline.getDate() + days)

    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      store: storeName,
      item: item.trim(),
      purchaseDate,
      returnDays: days,
      notes: notes.trim(),
      returned: false,
      createdAt: new Date().toISOString(),
      ...(photo ? { photo } : {}),
    })
  }

  const storeName = store === 'Other' ? customStore.trim() : store
  const days = parseInt(customDays) || 0
  const isValid = storeName && item.trim() && days > 0

  const deadline = parseLocalDate(purchaseDate)
  deadline.setDate(deadline.getDate() + (days || 0))
  const deadlineStr = isValid
    ? deadline.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-t-2xl w-full max-w-md px-5 pt-5 flex flex-col gap-4 overflow-y-auto"
        style={{ maxHeight: '92dvh', paddingBottom: 'max(1.25rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Add Return</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition">×</button>
        </div>

        {/* Store picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step 1 — Pick a store</label>
          <div className="grid grid-cols-3 gap-2">
            {STORE_POLICIES.map(p => (
              <button
                key={p.store}
                onClick={() => handleStoreChange(p.store)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold transition border ${store === p.store ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
              >
                {p.store}
                <span className="block text-slate-400 font-normal text-xs">{p.days}d</span>
              </button>
            ))}
          </div>
          {store === 'Other' && (
            <input
              autoFocus
              value={customStore}
              onChange={e => setCustomStore(e.target.value)}
              placeholder="Store name"
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
            />
          )}
        </div>

        {/* Item */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">What did you buy?</label>
          <input
            value={item}
            onChange={e => setItem(e.target.value)}
            placeholder="e.g. Blue running shoes, size 10"
            className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Purchase date + return window */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Purchase date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              max={today}
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Return window</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                placeholder="days"
                min={1}
                className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-0"
              />
              <span className="flex items-center text-slate-500 text-sm">days</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes (optional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Keep receipt in wallet, order #12345"
            className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Receipt photo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Receipt Photo (optional)</label>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Receipt" className="w-full max-h-48 object-cover rounded-xl border border-slate-700" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {Capacitor.isNativePlatform() && (
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  disabled={photoLoading}
                  className="flex-1 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  📷 Camera
                </button>
              )}
              <button
                type="button"
                onClick={handlePickPhoto}
                disabled={photoLoading}
                className="flex-1 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2"
              >
                {photoLoading ? '...' : '🖼 Gallery'}
              </button>
            </div>
          )}
        </div>

        {/* Deadline preview */}
        {isValid && (
          <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-slate-400 text-sm">Return by</span>
            <span className="text-indigo-300 font-bold">{deadlineStr}</span>
          </div>
        )}

        {!store && (
          <p className="text-amber-400 text-xs text-center -mt-2">👆 Tap a store above first</p>
        )}
        {store && !item.trim() && (
          <p className="text-amber-400 text-xs text-center -mt-2">👆 Enter what you bought</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition mb-2"
        >
          {isValid ? 'Save Return' : 'Fill in store + item to save'}
        </button>
      </div>
    </div>
  )
}
