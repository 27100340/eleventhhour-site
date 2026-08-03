'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Service } from '@/lib/types'
import { QtyStepper } from './QtyStepper'

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
  } else {
    currentQty = typeof rawValue === 'number' ? rawValue : Number(rawValue) || 0
  }

  const hasChildren = Array.isArray(service.children) && service.children.length > 0

  const setQty = (qty: number) => {
    onItemChange(service.id, Math.max(0, qty))
  }

  const toggleCheckbox = () => {
    const newValue = currentQty > 0 ? 0 : 1
    onItemChange(service.id, newValue)
  }

  const PriceTime = () =>
    (service.price > 0 || service.time_minutes > 0) && (
      <p className="text-xs text-ink-soft">
        {service.price > 0 && `£${service.price.toFixed(2)}`}
        {service.price > 0 && service.time_minutes > 0 && ' · '}
        {service.time_minutes > 0 && `${service.time_minutes} min`}
      </p>
    )

  // PARENT WITH CHILDREN: act as a header only (no +/- or checkbox), click to expand children
  if (hasChildren) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-start gap-3 rounded-(--radius-ctl) border border-line p-3.5 text-left transition-colors duration-150 hover:border-accent/60 hover:bg-accent-tint/40"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={`mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform duration-150 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium text-ink">{service.name}</p>
              <span className="hidden text-xs font-semibold text-accent sm:inline">
                {expanded ? 'Hide details' : 'View details'}
              </span>
            </div>
            {service.description && (
              <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
            )}
          </div>
        </button>

        {expanded && service.children && service.children.length > 0 && (
          <div className="ml-6 space-y-2 border-l-2 border-accent/20 pl-4">
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
      <div className="flex items-center gap-3 rounded-(--radius-ctl) border border-line bg-accent-tint/40 p-3.5 transition-colors duration-150 hover:border-accent/50">
        <QtyStepper qty={currentQty} onChange={setQty} compact />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-ink">{service.name}</p>
          {service.description && (
            <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
          )}
          <PriceTime />
        </div>
        {service.price > 0 && currentQty > 0 && (
          <span className="shrink-0 text-sm font-semibold text-accent-dark">
            £{(service.price * currentQty).toFixed(2)}
          </span>
        )}
      </div>
    )
  }

  // LEAF SERVICES
  if (service.question_type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-center gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:bg-paper">
        <input
          type="checkbox"
          checked={currentQty > 0}
          onChange={toggleCheckbox}
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
    )
  }

  if (service.question_type === 'dropdown' && service.dropdown_options?.length) {
    return (
      <div className="rounded-(--radius-ctl) border border-line p-3.5">
        <p className="font-medium text-ink">{service.name}</p>
        {service.description && (
          <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
        )}
        {showPrices && service.price > 0 && (
          <p className="mt-0.5 text-sm text-ink-soft">
            £{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
          </p>
        )}
        <select
          className="input mt-2 w-full"
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
    <div className="flex items-center gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:border-accent/50">
      <QtyStepper qty={currentQty} onChange={setQty} />
      <div className="flex-1">
        <p className="font-medium text-ink">{service.name}</p>
        {service.description && (
          <p className="mt-0.5 text-xs text-ink-soft">{service.description}</p>
        )}
        {showPrices && service.price > 0 && (
          <p className="text-sm text-ink-soft">
            £{service.price.toFixed(2)}
            {service.per_unit_type && service.per_unit_type !== 'item' && ` per ${service.per_unit_type}`}
            {service.time_minutes > 0 && ` · ${service.time_minutes} min`}
          </p>
        )}
      </div>
      {showPrices && service.price > 0 && currentQty > 0 && (
        <span className="text-lg font-semibold text-accent-dark">
          £{(service.price * currentQty).toFixed(2)}
        </span>
      )}
    </div>
  )
}
