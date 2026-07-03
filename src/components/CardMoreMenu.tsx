import { EditIcon, TrashIcon } from './icons'

interface Props {
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CardMoreMenu({ open, onClose, onEdit, onDelete }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-slate-900 border border-slate-800 rounded-t-2xl w-full max-w-md overflow-hidden"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 0.5rem)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => { onEdit(); onClose() }}
          className="min-h-14 w-full flex items-center gap-3 px-5 text-white text-base font-medium border-b border-slate-800 active:bg-slate-800 transition"
        >
          <EditIcon className="w-5 h-5 text-slate-400" /> Edit item
        </button>
        <button
          onClick={() => { onDelete(); onClose() }}
          className="min-h-14 w-full flex items-center gap-3 px-5 text-red-400 text-base font-medium active:bg-slate-800 transition"
        >
          <TrashIcon className="w-5 h-5" /> Delete
        </button>
        <button
          onClick={onClose}
          className="min-h-14 w-full flex items-center justify-center text-slate-500 text-sm font-semibold border-t border-slate-800 mt-1"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
