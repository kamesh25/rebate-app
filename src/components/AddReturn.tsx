import { useState } from 'react'
import type { ReturnItem } from '../types'
import { STORE_POLICIES, todayString, parseLocalDate } from '../types'
import { takeReceiptPhoto, pickReceiptPhoto } from '../hooks/useCamera'
import { Capacitor } from '@capacitor/core'
import { CameraIcon, GalleryIcon } from './icons'

interface Props {
  onAdd: (item: ReturnItem) => void
  onClose: () => void
  storePolicies: typeof STORE_POLICIES
  editItem?: ReturnItem
}

type Step = 'quick' | 'details'

export default function AddReturn({ onAdd, onClose, editItem }: Props) {
  const today = todayString()
  const editItemIsCustomStore = !!editItem && !STORE_POLICIES.some(p => p.store === editItem.store)
  const [step, setStep] = useState<Step>('quick')
  const [store, setStore] = useState(editItemIsCustomStore ? 'Other' : editItem?.store ?? '')
  const [customStore, setCustomStore] = useState(editItemIsCustomStore ? editItem!.store : '')
  const [item, setItem] = useState(editItem?.item ?? '')
  const [purchaseDate, setPurchaseDate] = useState(editItem?.purchaseDate ?? today)
  const [customDays, setCustomDays] = useState(String(editItem?.returnDays ?? 30))
  const [pricePaid, setPricePaid] = useState(editItem?.pricePaid != null ? String(editItem.pricePaid) : '')
  const [notes, setNotes] = useState(editItem?.notes ?? '')
  const [photo, setPhoto] = useState<string | null>(editItem?.photo ?? null)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [refundInput, setRefundInput] = useState(
    editItem?.refundAmount != null ? String(editItem.refundAmount) : ''
  )

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

    const priceValue = parseFloat(pricePaid)

    if (editItem) {
      onAdd({
        ...editItem,
        store: storeName,
        item: item.trim(),
        purchaseDate,
        returnDays: days,
        notes: notes.trim(),
        photo: photo ?? undefined,
        pricePaid: priceValue > 0 ? priceValue : undefined,
        ...(editItem.returned ? { refundAmount: parseFloat(refundInput) || 0 } : {}),
      })
      return
    }

    onAdd({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      store: storeName,
      item: item.trim(),
      purchaseDate,
      returnDays: days,
      notes: notes.trim(),
      returned: false,
      createdAt: new Date().toISOString(),
      ...(priceValue > 0 ? { pricePaid: priceValue } : {}),
      ...(photo ? { photo } : {}),
    })
  }

  const storeName = store === 'Other' ? customStore.trim() : store
  const days = parseInt(customDays) || 0
  const isValid = !!storeName && !!item.trim() && days > 0

  const deadline = parseLocalDate(purchaseDate)
  deadline.setDate(deadline.getDate() + (days || 0))
  const deadlineStr = isValid
    ? deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  const saveButton = (
    <button
      onClick={handleSubmit}
      disabled={!isValid}
      className="min-h-11 w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition flex flex-col items-center leading-tight"
    >
      <span>{editItem ? 'Update Return' : 'Save Return'}</span>
      {isValid && deadlineStr && (
        <span className="text-emerald-100 text-xs font-normal mt-0.5">Reminds you before {deadlineStr}</span>
      )}
    </button>
  )

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
        {step === 'quick' ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editItem ? 'Edit Return' : 'Add Return'}</h2>
              <button onClick={onClose} className="min-h-11 min-w-11 text-slate-500 hover:text-white text-xl leading-none transition flex items-center justify-center">×</button>
            </div>

            {/* Store picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Where did you buy it?</label>
              <div className="grid grid-cols-3 gap-2">
                {STORE_POLICIES.map(p => (
                  <button
                    key={p.store}
                    onClick={() => handleStoreChange(p.store)}
                    className={`min-h-11 py-2 px-2 rounded-xl text-xs font-semibold transition border ${store === p.store ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
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
                  className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 mt-1"
                />
              )}
            </div>

            {/* Item */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">What is it?</label>
              <input
                value={item}
                onChange={e => setItem(e.target.value)}
                placeholder="e.g. Blue running shoes, size 10"
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Price paid — surfaced here, not buried in Details, since it's the actual motivation */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">How much did it cost? (optional)</label>
              <div className="flex items-center bg-slate-800 border border-slate-700 focus-within:border-indigo-500 rounded-xl px-4 py-3 gap-2 transition">
                <span className="text-slate-400 font-bold text-lg">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={pricePaid}
                  onChange={e => setPricePaid(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-white text-lg font-bold flex-1 focus:outline-none placeholder-slate-600 w-0"
                />
              </div>
            </div>

            {!store && (
              <p className="text-amber-400 text-xs text-center -mt-2">Pick a store above first</p>
            )}

            {saveButton}

            <button
              onClick={() => setStep('details')}
              className="min-h-11 text-slate-500 text-sm text-center -mt-2"
            >
              Add photo, notes or adjust return window
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button onClick={() => setStep('quick')} className="min-h-11 min-w-11 flex items-center justify-center text-slate-400 hover:text-white transition text-xl leading-none">←</button>
              <h2 className="text-lg font-bold text-white">Details</h2>
              <button onClick={() => setStep('quick')} className="min-h-11 px-2 flex items-center text-slate-400 hover:text-white text-sm font-semibold transition">Back</button>
            </div>

            <div className="bg-slate-800/60 rounded-xl px-4 py-3">
              <p className="text-white font-semibold text-sm">{storeName || 'Store'} · {item || 'Item'}</p>
              {deadlineStr && <p className="text-slate-500 text-xs mt-0.5">Return by {deadlineStr}</p>}
            </div>

            {/* Purchase date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Purchase date</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={e => setPurchaseDate(e.target.value)}
                max={today}
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Return window stepper */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Return window</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCustomDays(String(Math.max(1, days - 1)))}
                  className="min-h-11 min-w-11 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-bold active:bg-slate-700 transition"
                >
                  −
                </button>
                <span className="flex-1 text-center text-white font-bold text-lg">{days} days</span>
                <button
                  onClick={() => setCustomDays(String(days + 1))}
                  className="min-h-11 min-w-11 flex items-center justify-center bg-slate-800 border border-slate-700 rounded-xl text-white text-lg font-bold active:bg-slate-700 transition"
                >
                  +
                </button>
              </div>
              <p className="text-slate-600 text-xs">Typical policy — verify against your receipt, holiday policies vary</p>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Notes (optional)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Keep receipt in wallet, order #12345"
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-base text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Receipt photo */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Receipt photo (optional)</label>
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
                      className="min-h-11 flex-1 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 text-sm rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <CameraIcon className="w-4 h-4" /> Camera
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handlePickPhoto}
                    disabled={photoLoading}
                    className="min-h-11 flex-1 bg-slate-800 border border-slate-700 hover:border-indigo-500 text-slate-300 text-sm rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <GalleryIcon className="w-4 h-4" /> {photoLoading ? '...' : 'Gallery'}
                  </button>
                </div>
              )}
            </div>

            {/* Refund amount — only editable once this return is already marked returned */}
            {editItem?.returned && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">How much did you get back?</label>
                <div className="flex items-center bg-slate-800 border border-slate-700 focus-within:border-emerald-500 rounded-xl px-4 py-3 gap-2 transition">
                  <span className="text-emerald-400 font-bold text-xl">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={refundInput}
                    onChange={e => setRefundInput(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-white text-2xl font-bold flex-1 focus:outline-none placeholder-slate-600 w-0"
                  />
                </div>
              </div>
            )}

            {saveButton}
          </>
        )}
      </div>
    </div>
  )
}
