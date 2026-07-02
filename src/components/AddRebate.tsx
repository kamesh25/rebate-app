import { useState } from 'react'
import type { RebateItem } from '../types'
import { STORE_POLICIES, todayString, parseLocalDate } from '../types'
import { takeReceiptPhoto, pickReceiptPhoto } from '../hooks/useCamera'
import { Capacitor } from '@capacitor/core'

interface Props {
  onAdd: (item: RebateItem) => void
  onClose: () => void
  editItem?: RebateItem
}

export default function AddRebate({ onAdd, onClose, editItem }: Props) {
  const today = todayString()
  const editItemIsCustomStore = !!editItem && !STORE_POLICIES.some(p => p.store === editItem.store)
  const [store, setStore] = useState(editItemIsCustomStore ? 'Other' : editItem?.store ?? '')
  const [customStore, setCustomStore] = useState(editItemIsCustomStore ? editItem!.store : '')
  const [item, setItem] = useState(editItem?.item ?? '')
  const [purchaseDate, setPurchaseDate] = useState(editItem?.purchaseDate ?? today)
  const [mailByDate, setMailByDate] = useState(editItem?.mailByDate ?? '')
  const [rebateAmount, setRebateAmount] = useState(editItem ? String(editItem.rebateAmount) : '')
  const [notes, setNotes] = useState(editItem?.notes ?? '')
  const [photo, setPhoto] = useState<string | null>(editItem?.photo ?? null)
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

  const storeName = store === 'Other' ? customStore.trim() : store
  const amount = parseFloat(rebateAmount) || 0
  const isValid = storeName && item.trim() && mailByDate && amount > 0

  const mailByPreview = mailByDate
    ? parseLocalDate(mailByDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : null

  function handleSubmit() {
    if (!isValid) return

    if (editItem) {
      onAdd({
        ...editItem,
        store: storeName,
        item: item.trim(),
        purchaseDate,
        mailByDate,
        rebateAmount: amount,
        notes: notes.trim(),
        photo: photo ?? undefined,
      })
      return
    }

    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      store: storeName,
      item: item.trim(),
      purchaseDate,
      mailByDate,
      rebateAmount: amount,
      submitted: false,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      ...(photo ? { photo } : {}),
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-t-2xl w-full max-w-md px-5 flex flex-col gap-4 overflow-y-auto"
        style={{
          maxHeight: '92dvh',
          paddingTop: 'calc(var(--safe-top) + 1.25rem)',
          paddingBottom: 'calc(var(--safe-bottom) + 1.25rem)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{editItem ? 'Edit Rebate' : 'Add Rebate'}</h2>
            <p className="text-purple-400 text-xs mt-0.5">Track your mail-in rebate deadline</p>
          </div>
          <button onClick={onClose} className="min-h-11 min-w-11 text-slate-500 hover:text-white text-xl leading-none transition flex items-center justify-center">×</button>
        </div>

        {/* Store picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step 1 — Pick a store</label>
          <div className="grid grid-cols-3 gap-2">
            {STORE_POLICIES.map(p => (
              <button
                key={p.store}
                onClick={() => setStore(p.store)}
                className={`min-h-11 flex items-center justify-center py-2 px-2 rounded-xl text-xs font-semibold transition border ${store === p.store ? 'bg-purple-700 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
              >
                {p.store}
              </button>
            ))}
          </div>
          {store === 'Other' && (
            <input
              autoFocus
              value={customStore}
              onChange={e => setCustomStore(e.target.value)}
              placeholder="Store or brand name"
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mt-1"
            />
          )}
        </div>

        {/* Item */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">What did you buy?</label>
          <input
            value={item}
            onChange={e => setItem(e.target.value)}
            placeholder="e.g. Goodyear tires, Dyson V11"
            className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Rebate amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rebate amount</label>
          <div className="flex items-center bg-slate-800 border border-slate-700 focus-within:border-purple-500 rounded-xl px-4 py-3 gap-2 transition">
            <span className="text-purple-400 font-bold text-xl">$</span>
            <input
              type="number"
              inputMode="decimal"
              value={rebateAmount}
              onChange={e => setRebateAmount(e.target.value)}
              placeholder="0.00"
              className="bg-transparent text-white text-2xl font-bold flex-1 focus:outline-none placeholder-slate-600 w-0"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Purchase date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              max={today}
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mail-by date</label>
            <input
              type="date"
              value={mailByDate}
              onChange={e => setMailByDate(e.target.value)}
              min={today}
              className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-slate-600 text-xs">Check your rebate form</p>
          </div>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes (optional)</label>
          <input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Cut UPC from box, form #12345"
            className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Receipt photo */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Rebate form / receipt (optional)</label>
          {photo ? (
            <div className="relative">
              <img src={photo} alt="Receipt" className="w-full max-h-48 object-cover rounded-xl border border-slate-700" />
              <button onClick={() => setPhoto(null)} className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              {Capacitor.isNativePlatform() && (
                <button type="button" onClick={handleTakePhoto} disabled={photoLoading}
                  className="flex-1 bg-slate-800 border border-slate-700 hover:border-purple-500 text-slate-300 text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                  📷 Camera
                </button>
              )}
              <button type="button" onClick={handlePickPhoto} disabled={photoLoading}
                className="flex-1 bg-slate-800 border border-slate-700 hover:border-purple-500 text-slate-300 text-sm py-2.5 rounded-xl transition flex items-center justify-center gap-2">
                {photoLoading ? '...' : '🖼 Gallery'}
              </button>
            </div>
          )}
        </div>

        {/* Deadline preview */}
        {isValid && mailByPreview && (
          <div className="bg-purple-950/50 border border-purple-800/50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-slate-400 text-sm">Mail by</span>
            <span className="text-purple-300 font-bold">{mailByPreview} · ${amount.toFixed(2)} back</span>
          </div>
        )}

        {!mailByDate && store && item.trim() && (
          <p className="text-amber-400 text-xs text-center -mt-2">👆 Enter the mail-by date from your rebate form</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className="min-h-11 bg-purple-700 hover:bg-purple-600 active:scale-95 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition mb-2"
        >
          {isValid ? (editItem ? 'Update Rebate' : 'Save Rebate') : 'Fill in details to save'}
        </button>
      </div>
    </div>
  )
}
