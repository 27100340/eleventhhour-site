'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Service } from '@/lib/types'
import { NestedServiceSelector } from './NestedServiceSelector'
import { QtyStepper } from './QtyStepper'

type Props = {
  title: string
  description?: string
  services: Service[]
  items: Record<string, number | string>
  onItemChange: (serviceId: string, value: number | string) => void
  showExtrasLabel?: boolean
  extrasStartIndex?: number
  showPrices?: boolean
  defaultExpandedNested?: boolean
}

export function ServiceSection({
  title,
  description,
  services,
  items,
  onItemChange,
  showExtrasLabel = false,
  extrasStartIndex = 0,
  showPrices = false,
  defaultExpandedNested = false,
}: Props) {
  const [expanded, setExpanded] = useState(true)

  const handleQtyChange = (serviceId: string, qty: number) => {
    const newQty = Math.max(0, qty)
    // Always call onItemChange to ensure parent gets re-selected properly
    onItemChange(serviceId, newQty)
  }

  const handleCheckboxToggle = (serviceId: string) => {
    const currentValue = items[serviceId]
    const currentQty = typeof currentValue === 'number' ? currentValue : Number(currentValue as string | number) || 0
    const newValue = currentQty > 0 ? 0 : 1
    // Always call onItemChange to ensure parent gets re-selected properly
    onItemChange(serviceId, newValue)
  }

  const handleDropdownChange = (serviceId: string, value: string | number) => {
    onItemChange(serviceId, value)
  }

  const handleExpandToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded(!expanded)
  }

  return (
    <div className="overflow-hidden rounded-(--radius-card) border border-line bg-surface">
      {/* Header */}
      <button
        type="button"
        onClick={handleExpandToggle}
        className="flex w-full cursor-pointer items-center justify-between bg-accent-tint/60 p-5 transition-colors duration-150 hover:bg-accent-tint"
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <div className="pointer-events-none text-left">
          <h3 className="text-base">{title}</h3>
          {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
        </div>
        <ChevronDown
          className={`pointer-events-none h-5 w-5 shrink-0 text-ink-soft transition-transform duration-150 ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Content */}
      {expanded && (
        <div className="space-y-3 p-5">
          {services.map((service, index) => {
            const currentValue = items[service.id] ?? 0
            const currentQty =
              typeof currentValue === 'number' ? currentValue : Number(currentValue as string | number) || 0

            const isExtra = showExtrasLabel && index >= extrasStartIndex
            const showExtrasDivider = showExtrasLabel && index === extrasStartIndex
            const hasChildren = service.children && service.children.length > 0

            return (
              <div key={service.id}>
                {showExtrasDivider && (
                  <div className="pb-2 pt-4">
                    <h4 className="inline-block border-b-2 border-accent pb-1 text-sm font-semibold text-ink">
                      Extras
                    </h4>
                  </div>
                )}

                {/* Use NestedServiceSelector for services with children */}
                {hasChildren ? (
                  <NestedServiceSelector
                    service={service}
                    items={items}
                    onItemChange={onItemChange}
                    showPrices={showPrices}
                    defaultExpanded={defaultExpandedNested}
                  />
                ) : (
                  <>
                    {/* Dropdown style for non-extra dropdown-type services */}
                    {service.question_type === 'dropdown' && service.dropdown_options?.length && !isExtra ? (
                      <div className="rounded-(--radius-ctl) border border-line bg-surface p-3.5">
                        <p className="font-medium text-ink">{service.name}</p>
                        {service.description && (
                          <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
                        )}
                        {showPrices && service.price > 0 && (
                          <p className="mt-0.5 text-xs text-ink-soft">
                            £{service.price.toFixed(2)}
                            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
                            {service.time_minutes > 0 && ` · ${service.time_minutes} min`}
                          </p>
                        )}
                        <select
                          className="input mt-2 w-full"
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
                      <label className="flex cursor-pointer items-center gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:border-accent/50">
                        <input
                          type="checkbox"
                          checked={currentQty > 0}
                          onChange={() => handleCheckboxToggle(service.id)}
                          className="h-4.5 w-4.5 cursor-pointer accent-(--color-accent)"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink">{service.name}</p>
                          {service.description && (
                            <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
                          )}
                          {showPrices && service.price > 0 && (
                            <p className="text-sm text-ink-soft">
                              £{service.price.toFixed(2)}
                              {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
                            </p>
                          )}
                        </div>
                        {showPrices && service.price > 0 && currentQty > 0 && (
                          <span className="font-semibold text-accent-dark">
                            £{(service.price * currentQty).toFixed(2)}
                          </span>
                        )}
                      </label>
                    ) : (
                      // Plus/minus style (default, including extras)
                      <div className="flex items-center gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:border-accent/50">
                        <QtyStepper
                          qty={currentQty}
                          onChange={(qty) => handleQtyChange(service.id, qty)}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-ink">{service.name}</p>
                          {service.description && (
                            <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
                          )}
                          {showPrices && service.price > 0 && (
                            <p className="text-sm text-ink-soft">
                              £{service.price.toFixed(2)}
                              {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
                            </p>
                          )}
                        </div>
                        {showPrices && service.price > 0 && currentQty > 0 && (
                          <span className="text-lg font-semibold text-accent-dark">
                            £{(service.price * currentQty).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
