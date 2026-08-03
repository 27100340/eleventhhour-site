// src/lib/pricing.ts
// Single source of truth for booking price math, shared by the public booking
// form, the admin create-booking flow, and every server route that persists or
// charges a total. Regular Cleaning is priced as hours × rate × cleaners; the
// two driver rows must never be charged as independent line items.

export type PricingServiceInfo = {
  id: string
  name: string
  price?: number | null
  parent_id?: string | null
  is_category?: boolean | null
  category_type?: string | null
}

export type PricingItemInput = {
  service_id: string
  qty: number
  unit_price: number
  time_minutes: number
  name?: string
}

export type RegularCleaningBreakdown = {
  hours: number
  cleaners: number
  pricePerHour: number
  amount: number
  categoryName: string
  hoursServiceId: string
  cleanersServiceId: string
}

export type BookingTotals = {
  subtotal: number
  totalTimeMinutes: number
  regular: RegularCleaningBreakdown | null
}

const HOURS_PATTERN = /hour/i
const CLEANERS_PATTERN = /cleaner/i

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function findRegularCleaning(
  items: PricingItemInput[],
  services: PricingServiceInfo[],
): RegularCleaningBreakdown | null {
  const category = services.find(
    (s) => s.is_category && s.category_type === 'regular_cleaning',
  )
  if (!category) return null

  const children = services.filter((s) => s.parent_id === category.id)
  const hoursService = children.find((s) => HOURS_PATTERN.test(s.name))
  const cleanersService = children.find((s) => CLEANERS_PATTERN.test(s.name))
  if (!hoursService || !cleanersService) return null

  const hoursItem = items.find((i) => i.service_id === hoursService.id)
  const cleanersItem = items.find((i) => i.service_id === cleanersService.id)
  if (!hoursItem || !cleanersItem) return null

  const hours = Number(hoursItem.qty) || 0
  const cleaners = Number(cleanersItem.qty) || 0
  if (hours <= 0 || cleaners <= 0) return null

  const pricePerHour = Number(hoursService.price ?? hoursItem.unit_price) || 0
  return {
    hours,
    cleaners,
    pricePerHour,
    amount: round2(hours * pricePerHour * cleaners),
    categoryName: category.name,
    hoursServiceId: hoursService.id,
    cleanersServiceId: cleanersService.id,
  }
}

/**
 * Compute subtotal and total time for a set of booking items.
 * When the items include the Regular Cleaning hours + cleaners drivers, that
 * portion is priced as hours × rate × cleaners and the two driver rows are
 * excluded from the flat per-item sum. Everything else is qty × unit_price.
 */
export function computeBookingTotals(
  items: PricingItemInput[],
  services: PricingServiceInfo[],
): BookingTotals {
  const regular = findRegularCleaning(items, services)
  const excluded = new Set(
    regular ? [regular.hoursServiceId, regular.cleanersServiceId] : [],
  )

  let flat = 0
  let minutes = 0
  for (const item of items) {
    const qty = Number(item.qty) || 0
    minutes += qty * (Number(item.time_minutes) || 0)
    if (!excluded.has(item.service_id)) {
      flat += qty * (Number(item.unit_price) || 0)
    }
  }

  return {
    subtotal: round2(flat + (regular?.amount ?? 0)),
    totalTimeMinutes: minutes,
    regular,
  }
}

export type StripeLineDescriptor = {
  name: string
  description?: string
  unit_amount_pence: number
  quantity: number
}

/**
 * Build Stripe line items whose sum always equals computeBookingTotals().subtotal.
 * Regular Cleaning collapses to a single line so the charge matches the
 * displayed hours × rate × cleaners price.
 */
export function buildStripeLines(
  items: PricingItemInput[],
  services: PricingServiceInfo[],
): StripeLineDescriptor[] {
  const totals = computeBookingTotals(items, services)
  const excluded = new Set(
    totals.regular
      ? [totals.regular.hoursServiceId, totals.regular.cleanersServiceId]
      : [],
  )
  const serviceById = new Map(services.map((s) => [s.id, s]))

  const lines: StripeLineDescriptor[] = []
  if (totals.regular) {
    const r = totals.regular
    lines.push({
      name: r.categoryName || 'Regular Cleaning',
      description: `${r.hours} hour${r.hours === 1 ? '' : 's'} × ${r.cleaners} cleaner${r.cleaners === 1 ? '' : 's'}`,
      unit_amount_pence: Math.round(r.amount * 100),
      quantity: 1,
    })
  }

  for (const item of items) {
    if (excluded.has(item.service_id)) continue
    const qty = Number(item.qty) || 0
    const unitPence = Math.round((Number(item.unit_price) || 0) * 100)
    if (qty <= 0 || unitPence <= 0) continue
    const service = serviceById.get(item.service_id)
    lines.push({
      name: item.name || service?.name || 'Cleaning service',
      description:
        item.time_minutes > 0 ? `${item.time_minutes} minutes` : undefined,
      unit_amount_pence: unitPence,
      quantity: qty,
    })
  }

  return lines
}
