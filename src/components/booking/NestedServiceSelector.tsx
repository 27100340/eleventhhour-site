'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'

type Props = {
  service: Service
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
}

export function NestedServiceSelector({ service, items, onItemChange }: Props) {
  const [expanded, setExpanded] = useState(true)

  // Get current value
  const currentValue = items[service.id] || 0
  const currentQty = typeof currentValue === 'number' ? currentValue : 0

  // Handle quantity change
  const setQty = (qty: number) => {
    onItemChange(service.id, Math.max(0, qty))
  }

  // Handle checkbox toggle
  const toggleCheckbox = () => {
    onItemChange(service.id, currentQty > 0 ? 0 : 1)
  }

  // If this is a category, render as expandable section
  if (service.is_category) {
    return (
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 bg-brand-amber/10 hover:bg-brand-amber/20 rounded-xl transition-colors border-2 border-brand-amber/30"
        >
          <span className="font-semibold text-brand-charcoal text-lg">{service.name}</span>
          <svg
            className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && service.children && service.children.length > 0 && (
          <div className="mt-3 ml-4 space-y-3 border-l-2 border-brand-amber/20 pl-4">
            {service.children.map((child) => (
              <NestedServiceSelector
                key={child.id}
                service={child}
                items={items}
                onItemChange={onItemChange}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Render based on question type
  if (service.question_type === 'checkbox') {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          checked={currentQty > 0}
          onChange={toggleCheckbox}
          className="w-5 h-5 text-brand-amber focus:ring-brand-amber rounded"
        />
        <div className="flex-1">
          <p className="font-medium text-brand-charcoal">{service.name}</p>
          {service.price > 0 && (
            <p className="text-sm text-gray-600">
              £{service.price.toFixed(2)}
              {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            </p>
          )}
        </div>
        {service.price > 0 && currentQty > 0 && (
          <span className="text-brand-amber font-semibold">
            £{(service.price * currentQty).toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  if (service.question_type === 'dropdown' && service.dropdown_options?.length) {
    return (
      <div className="p-3 rounded-lg border">
        <p className="font-medium mb-2 text-brand-charcoal">{service.name}</p>
        <select
          className="input w-full"
          value={currentValue || ''}
          onChange={(e) => onItemChange(service.id, e.target.value)}
        >
          <option value="">Select an option</option>
          {service.dropdown_options.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Default: plus_minus
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-brand-amber/50 transition-colors">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold"
          onClick={() => setQty(currentQty - 1)}
        >
          -
        </button>
        <input
          type="number"
          min={0}
          className="input w-16 text-center"
          value={currentQty}
          onChange={(e) => setQty(Number(e.target.value))}
        />
        <button
          type="button"
          className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold"
          onClick={() => setQty(currentQty + 1)}
        >
          +
        </button>
      </div>
      <div className="flex-1">
        <p className="font-medium text-brand-charcoal">{service.name}</p>
        {service.price > 0 && (
          <p className="text-sm text-gray-600">
            £{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            {service.time_minutes > 0 && ` • ${service.time_minutes} min`}
          </p>
        )}
      </div>
      {service.price > 0 && currentQty > 0 && (
        <span className="text-brand-amber font-bold text-lg">
          £{(service.price * currentQty).toFixed(2)}
        </span>
      )}
    </div>
  )
}
