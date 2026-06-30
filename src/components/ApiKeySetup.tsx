import { useState } from 'react'

export default function ApiKeySetup({ onSave }: { onSave: (key: string) => void }) {
  const [key, setKey] = useState('')

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-6">
      <div className="text-center">
        <p className="text-5xl mb-4">🛍</p>
        <h1 className="text-2xl font-bold text-white">ReturnIt</h1>
        <p className="text-slate-400 text-sm mt-2">One-time setup to enable receipt scanning</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <p className="text-white font-semibold mb-1">Anthropic API Key</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            Used to read your receipt photos and auto-fill return details. Stored only on this device.
          </p>
        </div>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="sk-ant-..."
          className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => { if (key.trim()) onSave(key.trim()) }}
          disabled={!key.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition"
        >
          Get Started
        </button>
        <button
          onClick={() => onSave('')}
          className="text-slate-600 text-xs text-center hover:text-slate-400 transition"
        >
          Skip — use manual entry only
        </button>
      </div>

      <p className="text-slate-700 text-xs text-center max-w-xs">
        Get a free API key at console.anthropic.com · Key never leaves your device
      </p>
    </div>
  )
}
