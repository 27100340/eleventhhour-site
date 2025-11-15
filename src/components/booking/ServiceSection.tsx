'use client'

import { useState } from 'react'
import type { Service } from '@/lib/types'

type Props = {
  title: string
  description?: string
  services: Service[]
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
  showExtrasLabel?: boolean
  extrasStartIndex?: number
}

export function ServiceSection({
  title,
  description,
  services,
  items,
  onItemChange,
  showExtrasLabel = false,
  extrasStartIndex = 0,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const handleQtyChange = (serviceId: string, qty: number) => {
    onItemChange(serviceId, Math.max(0, qty))
  }

  const handleCheckboxToggle = (serviceId: string) => {
    const currentValue = items[serviceId]
    const currentQty = typeof currentValue === 'number' ? currentValue : Number(currentValue as string | number) || 0
    onItemChange(serviceId, currentQty > 0 ? 0 : 1)
  }

  const handleDropdownChange = (serviceId: string, value: string | number) => {
    onItemChange(serviceId, value)
  }

  return (
    <div className="rounded-2xl border-2 border-brand-stone bg-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 bg-brand-amber/5 hover:bg-brand-amber/10 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-bold text-brand-charcoal">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform text-brand-charcoal ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-5 space-y-3">
          {services.map((service, index) => {
            const currentValue = items[service.id] ?? 0
            const currentQty =
              typeof currentValue === 'number' ? currentValue : Number(currentValue as string | number) || 0

            const isExtra = showExtrasLabel && index >= extrasStartIndex
            const showExtrasDivider = showExtrasLabel && index === extrasStartIndex

            return (
              <div key={service.id}>
                {showExtrasDivider && (
                  <div className="pt-4 pb-2">
                    <h4 className="text-md font-semibold text-brand-charcoal border-b-2 border-brand-amber inline-block pb-1">
                      Extras
                    </h4>
                  </div>
                )}

                {/* Dropdown style for non-extra dropdown-type services */}
                {service.question_type === 'dropdown' && service.dropdown_options?.length && !isExtra ? (
                  <div className="p-3 rounded-lg border bg-white">
                    <p className="font-medium mb-1 text-brand-charcoal">{service.name}</p>
                    {service.price > 0 && (
                      <p className="text-xs text-gray-600 mb-2">
                        £{service.price.toFixed(2)}
                        {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
                        {service.time_minutes > 0 && ` · ${service.time_minutes} min`}
                      </p>
                    )}
                    <select
                      className="input w-full"
                      value={currentValue ?? ''}
                      onChange={(e) => handleDropdownChange(service.id, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {service.dropdown_options.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : service.question_type === 'checkbox' && !isExtra ? (
                  // Checkbox style
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-brand-amber/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={currentQty > 0}
                      onChange={() => handleCheckboxToggle(service.id)}
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
                      <span className="text-brand-amber font-bold">
                        £{(service.price * currentQty).toFixed(2)}
                      </span>
                    )}
                  </div>
                ) : (
                  // Plus/minus style (default, including extras)
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:border-brand-amber/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center"
                        onClick={() => handleQtyChange(service.id, currentQty - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        className="input w-16 text-center"
                        value={currentQty}
                        onChange={(e) => handleQtyChange(service.id, Number(e.target.value))}
                      />
                      <button
                        type="button"
                        className="rounded-full border-2 border-brand-charcoal w-8 h-8 hover:bg-brand-charcoal hover:text-white transition-colors font-bold flex items-center justify-center"
                        onClick={() => handleQtyChange(service.id, currentQty + 1)}
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
                        </p>
                      )}
                    </div>
                    {service.price > 0 && currentQty > 0 && (
                      <span className="text-brand-amber font-bold text-lg">
                        £{(service.price * currentQty).toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

