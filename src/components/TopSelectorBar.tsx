'use client'
import { useMode } from './ModeContext'

export default function TopSelectorBar() {
  const { mode, setMode } = useMode()
  const Btn = ({ value }: { value: 'household' | 'commercial' }) => (
    <button
      onClick={() => setMode(value)}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition
        ${mode === value ? 'bg-brand-500 text-white border-brand-500 shadow' :
        'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
      aria-pressed={mode === value}
    >
      {value === 'household' ? 'Household' : 'Commercial'}
    </button>
  )
  return (
    <div className="w-full bg-slate-50 border-b">
      <div className="mx-auto max-w-6xl flex items-center justify-center gap-3 py-2">
        <span className="text-xs uppercase tracking-wide text-slate-600">Browse:</span>
        <Btn value="household" />
        <Btn value="commercial" />
      </div>
    </div>
  )
}
