'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'

type Props = {
  service: Service
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
  showPrices?: boolean
}

export function NestedServiceSelector({ service, items, onItemChange, showPrices = false }: Props) {
  // Start collapsed by default; user can expand to see child services.
  const [expanded, setExpanded] = useState(false)

  // Get current value
  const currentValue = items[service.id] || 0
  const currentQty = typeof currentValue === 'number' ? currentValue : 0

  // Determine if this service has children (parent service)
  const hasChildren = service.children && service.children.length > 0

  // Handle quantity change - ensure it always calls onItemChange
  const setQty = (qty: number) => {
    const newQty = Math.max(0, qty)
    // Always call onItemChange, even if value is same (important for re-selection)
    onItemChange(service.id, newQty)
  }

  // Handle checkbox toggle - ensure it always calls onItemChange
  const toggleCheckbox = () => {
    const newValue = currentQty > 0 ? 0 : 1
    onItemChange(service.id, newValue)
  }

  // Handle expand/collapse for category with better event handling
  const handleExpandToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(!expanded)
  }

  // If this service has children (parent service with children), show as expandable section AND allow parent selection
  if (hasChildren) {
    return (
      <div className="mb-4 space-y-2">
        {/* PARENT SERVICE SELECTION ROW */}
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Button */}
          <button
            type="button"
            onClick={handleExpandToggle}
            className="flex-shrink-0 p-1.5 hover:bg-brand-amber/20 rounded transition-colors border border-brand-amber/30 cursor-pointer pointer-events-auto"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Collapse' : 'Expand'} ${service.name}`}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Parent Service Selection - ALWAYS clickable */}
          <div className="flex-1 flex items-center gap-3 p-3 rounded-lg border hover:border-brand-amber/50 transition-colors bg-brand-amber/5 pointer-events-auto">
            {service.question_type === 'checkbox' ? (
              <>
                <input
                  type="checkbox"
                  checked={currentQty > 0}
                  onChange={toggleCheckbox}
                  className="w-5 h-5 text-brand-amber focus:ring-brand-amber rounded cursor-pointer flex-shrink-0 pointer-events-auto"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-charcoal">{service.name}</p>
                  {(service.price > 0 || service.time_minutes > 0) && (
                    <p className="text-xs text-gray-600">
                      {service.price > 0 && `£${service.price.toFixed(2)}`}
                      {service.price > 0 && service.time_minutes > 0 && ' • '}
                      {service.time_minutes > 0 && `${service.time_minutes} min`}
                    </p>
                  )}
                </div>
                {service.price > 0 && currentQty > 0 && (
                  <span className="text-brand-amber font-semibold text-sm flex-shrink-0">
                    £{(service.price * currentQty).toFixed(2)}
                  </span>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQty(currentQty - 1)
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    className="input w-12 text-center text-sm pointer-events-auto"
                    value={currentQty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center cursor-pointer pointer-events-auto"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setQty(currentQty + 1)
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-brand-charcoal">{service.name}</p>
                  {(service.price > 0 || service.time_minutes > 0) && (
                    <p className="text-xs text-gray-600">
                      {service.price > 0 && `£${service.price.toFixed(2)}`}
                      {service.price > 0 && service.time_minutes > 0 && ' • '}
                      {service.time_minutes > 0 && `${service.time_minutes} min`}
                    </p>
                  )}
                </div>
                {service.price > 0 && currentQty > 0 && (
                  <span className="text-brand-amber font-bold text-sm flex-shrink-0">
                    £{(service.price * currentQty).toFixed(2)}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* CHILDREN SERVICES - shown when expanded */}
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

  // If this service is marked as category but has NO children, treat it as a regular selectable service
  if (service.is_category && !hasChildren) {
    // Render as a regular service with quantity controls - ALWAYS selectable
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
          {(service.price > 0 || service.time_minutes > 0) && (
            <p className="text-xs text-gray-600">
              {service.price > 0 && `£${service.price.toFixed(2)}`}
              {service.price > 0 && service.time_minutes > 0 && ' • '}
              {service.time_minutes > 0 && `${service.time_minutes} min`}
            </p>
          )}
        </div>
        {service.price > 0 && currentQty > 0 && (
          <span className="text-brand-amber font-bold text-sm flex-shrink-0">
            £{(service.price * currentQty).toFixed(2)}
          </span>
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
          {showPrices && service.price > 0 && (
            <p className="text-sm text-gray-600">
              £{service.price.toFixed(2)}
              {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            </p>
          )}
        </div>
        {showPrices && service.price > 0 && currentQty > 0 && (
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
        {showPrices && service.price > 0 && (
          <p className="text-sm text-gray-600 mb-2">
            £{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
          </p>
        )}
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
        {showPrices && service.price > 0 && (
          <p className="text-sm text-gray-600">
            £{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            {service.time_minutes > 0 && ` • ${service.time_minutes} min`}
          </p>
        )}
      </div>
      {showPrices && service.price > 0 && currentQty > 0 && (
        <span className="text-brand-amber font-bold text-lg">
          £{(service.price * currentQty).toFixed(2)}
        </span>
      )}
    </div>
  )
}
