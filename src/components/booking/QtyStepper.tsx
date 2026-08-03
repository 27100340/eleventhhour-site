'use client'

import { Minus, Plus } from 'lucide-react'

type Props = {
  qty: number
  onChange: (qty: number) => void
  compact?: boolean
}

/** Shared minus / count / plus control used across the booking selectors. */
export function QtyStepper({ qty, onChange, compact = false }: Props) {
  const btn =
    'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink/60 text-ink transition-colors duration-150 hover:bg-ink hover:text-paper'
  return (
    <div className="flex shrink-0 items-center gap-2">
      <button
        type="button"
        className={btn}
        aria-label="Decrease quantity"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange(Math.max(0, qty - 1))
        }}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={0}
        className={`input text-center ${compact ? 'w-14 text-sm' : 'w-16'}`}
        value={qty}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
      />
      <button
        type="button"
        className={btn}
        aria-label="Increase quantity"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onChange(qty + 1)
        }}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
