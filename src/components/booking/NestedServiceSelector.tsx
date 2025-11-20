'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'

type Props = {
  service: Service
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
  showPrices?: boolean
  defaultExpanded?: boolean
}

export function NestedServiceSelector({ service, items, onItemChange, showPrices = false, defaultExpanded = false }: Props) {
  // Start collapsed by default; user can expand to see child services.
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Current raw value from form state
  const rawValue = items[service.id] ?? 0

  // Derive numeric quantity for controls
  let currentQty = 0
  if (service.question_type === 'checkbox') {
    currentQty = rawValue ? 1 : 0
  } else if (service.question_type === 'dropdown') {
    currentQty = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0
  } else {
    currentQty = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0
  }

  const hasChildren = Array.isArray(service.children) && service.children.length > 0

  const setQty = (qty: number) => {
    const newQty = Math.max(0, qty)
    onItemChange(service.id, newQty)
  }

  const toggleCheckbox = () => {
    const newValue = currentQty > 0 ? 0 : 1
    onItemChange(service.id, newValue)
  }

  const handleExpandToggle = () => {
    setExpanded((prev) => !prev)
  }

  const PriceTime = () =>
    (service.price > 0 || service.time_minutes > 0) && (
      <p className="text-xs text-gray-600">
        {service.price > 0 && `A�${service.price.toFixed(2)}`}
        {service.price > 0 && service.time_minutes > 0 && ' �?� '}
        {service.time_minutes > 0 && `${service.time_minutes} min`}
      </p>
    )

  // PARENT WITH CHILDREN: act as a header only (no +/- or checkbox), click to expand children
  if (hasChildren) {
    return (
      <div className="mb-4 space-y-2">
        <button
          type="button"
          onClick={handleExpandToggle}
          className="w-full flex items-start gap-3 p-3 rounded-lg border hover:border-brand-amber/60 hover:bg-brand-amber/5 transition-colors text-left pointer-events-auto"
        >
          <div className="mt-0.5 flex-shrink-0">
            <svg
              className={`w-5 h-5 transform transition-transform text-brand-amber ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-brand-charcoal">{service.name}</p>
              <span className="text-xs text-brand-amber font-semibold hidden sm:inline">
                {expanded ? 'Hide details' : 'View details'}
              </span>
            </div>
            {service.description && (
              <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
            )}
          </div>
        </button>

        {expanded && service.children && service.children.length > 0 && (
          <div className="ml-6 space-y-2 border-l-2 border-brand-amber/20 pl-4">
            {service.children.map((child) => (
              <NestedServiceSelector
                key={child.id}
                service={child}
                items={items}
                onItemChange={onItemChange}
                showPrices={showPrices}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // CATEGORY WITH NO CHILDREN (still selectable)
  if (service.is_category && !hasChildren) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-brand-amber/50 transition-colors bg-brand-amber/5 pointer-events-auto">
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center cursor-pointer pointer-events-auto"
            onClick={() => setQty(currentQty - 1)}
          >
            -
          </button>
          <input
            type="number"
            min={0}
            className="input w-14 text-center text-sm pointer-events-auto"
            value={currentQty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
          <button
            type="button"
            className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center cursor-pointer pointer-events-auto"
            onClick={() => setQty(currentQty + 1)}
          >
            +
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-brand-charcoal text-sm">{service.name}</p>
          {service.description && (
            <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
          )}
          <PriceTime />
        </div>
        {service.price > 0 && currentQty > 0 && (
          <span className="text-brand-amber font-bold text-sm flex-shrink-0">
            A�{(service.price * currentQty).toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  // LEAF SERVICES
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
          {service.description && (
            <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
          )}
          {showPrices && service.price > 0 && (
            <p className="text-sm text-gray-600">
              A�{service.price.toFixed(2)}
              {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            </p>
          )}
        </div>
        {showPrices && service.price > 0 && currentQty > 0 && (
          <span className="text-brand-amber font-semibold">
            A�{(service.price * currentQty).toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  if (service.question_type === 'dropdown' && service.dropdown_options?.length) {
    return (
      <div className="p-3 rounded-lg border">
        <p className="font-medium mb-1 text-brand-charcoal">{service.name}</p>
        {service.description && (
          <p className="text-xs text-gray-600 mb-1">{service.description}</p>
        )}
        {showPrices && service.price > 0 && (
          <p className="text-sm text-gray-600 mb-2">
            A�{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
          </p>
        )}
        <select
          className="input w-full"
          value={rawValue || ''}
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
        {service.description && (
          <p className="text-xs text-gray-600 mt-0.5">{service.description}</p>
        )}
        {showPrices && service.price > 0 && (
          <p className="text-sm text-gray-600">
            A�{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            {service.time_minutes > 0 && ` �?� ${service.time_minutes} min`}
          </p>
        )}
      </div>
      {showPrices && service.price > 0 && currentQty > 0 && (
        <span className="text-brand-amber font-bold text-lg">
          A�{(service.price * currentQty).toFixed(2)}
        </span>
      )}
    </div>
  )
}
