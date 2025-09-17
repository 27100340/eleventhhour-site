'use client'
import { useMode } from './ModeContext'

export default function TopSelectorBar() {
  const { mode, setMode } = useMode()

  const Btn = ({ value }: { value: 'household' | 'commercial' }) => (
    <button
      onClick={() => setMode(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        mode === value
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
          : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
      }`}
      aria-pressed={mode === value}
    >
      {value === 'household' ? 'Household Services' : 'Commercial Services'}
    </button>
  )

  return (
    <div className="w-full bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200/50">
      <div className="mx-auto max-w-7xl flex items-center justify-center gap-4 py-3 px-6">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
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
