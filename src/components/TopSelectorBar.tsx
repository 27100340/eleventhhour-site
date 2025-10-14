'use client'
import { useMode } from './ModeContext'

export default function TopSelectorBar() {
  const { mode, setMode } = useMode()

  const Btn = ({ value }: { value: 'household' | 'commercial' }) => (
    <button
      onClick={() => setMode(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        mode === value
          ? 'bg-brand-amber text-white shadow-lg'
          : 'bg-white text-brand-charcoal hover:text-brand-amber hover:bg-brand-cream border border-brand-stone hover:border-brand-amber/40'
      }`}
      aria-pressed={mode === value}
    >
      {value === 'household' ? 'Household Services' : 'Commercial Services'}
    </button>
  )

  return (
    <div className="w-full bg-gradient-to-r from-brand-cream to-brand-sage/20 border-b border-brand-stone/50">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 py-3 px-6">
        <span className="text-xs font-semibold text-brand-charcoal/70 uppercase tracking-wider">
          Services for:
        </span>
        <div className="flex items-center gap-2">
          <Btn value="household" />
          <Btn value="commercial" />
        </div>
      </div>
    </div>
  )
}
