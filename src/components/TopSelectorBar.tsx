'use client'
import { useMode } from './ModeContext'

export default function TopSelectorBar() {
  const { mode, setMode } = useMode()

  const Btn = ({ value }: { value: 'household' | 'commercial' }) => (
    <button
      onClick={() => setMode(value)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
        mode === value
          ? 'bg-ink text-paper'
          : 'text-ink-soft hover:text-ink'
      }`}
      aria-pressed={mode === value}
    >
      {value === 'household' ? 'Household' : 'Commercial'}
    </button>
  )

  return (
    <div className="w-full border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-6 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Services for
        </span>
        <div className="inline-flex items-center gap-0.5 rounded-full border border-line bg-paper p-0.5">
          <Btn value="household" />
          <Btn value="commercial" />
        </div>
      </div>
    </div>
  )
}
