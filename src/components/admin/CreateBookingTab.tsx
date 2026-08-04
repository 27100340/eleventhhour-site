'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase/browser'
import { adminFetch } from '@/lib/admin-fetch'
import { computeBookingTotals } from '@/lib/pricing'
import type { Service } from '@/lib/types'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ServiceSection } from '@/components/booking/ServiceSection'
import { CategoryPicker } from '@/components/booking/CategoryPicker'
import { buildCategorySection } from '@/components/booking/categorySection'
import { useToast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'

function SectionCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-5">
      {title && <h3 className="mb-4 text-base">{title}</h3>}
      {children}
    </div>
  )
}

export default function CreateBookingTab() {
  const toast = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    serviceDate: '',
    frequency: 'one_time' as 'one_time' | 'weekly' | 'bi_weekly' | 'monthly',
    arrivalWindow: 'exact' as 'exact' | 'morning' | 'afternoon',
    items: {} as Record<string, number | string>,
    notes: '',
    discount: 0,
    processStripePayment: false,
    generateInvoice: true,
  })
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const bust = Date.now()
      const res = await fetch(`/api/public/services?hierarchical=true&v=${bust}`, {
        cache: 'no-store' as RequestCache,
      })
      const json = await res.json()
      const data = (json?.data || []) as Service[]
      setServices(data)
    })()
  }, [])

  function updateItem(id: string, value: number | string) {
    setForm((f) => ({
      ...f,
      items: {
        ...f.items,
        [id]: value,
      },
    }))
  }

  const flattenServices = (nodes: Service[]): Service[] => {
    const result: Service[] = []

    const visit = (s: Service) => {
      result.push(s)
      if (Array.isArray(s.children)) {
        s.children.forEach(visit)
      }
    }

    nodes.forEach(visit)
    return result
  }

  const allServicesFlat = useMemo(() => flattenServices(services), [services])

  // All top-level categories for admin selection (matches public booking form)
  const allCategories = useMemo(() => {
    return services.filter((s) => s.is_category && !s.parent_id)
  }, [services])

  // Calculate rows with quantities, including parent category wrapper (qty 1)
  const rows = useMemo(
    () =>
      allServicesFlat.map((s) => {
        const value = form.items[s.id] ?? 0

        const isSelectedTopLevelCategory =
          selectedCategoryId === s.id && s.is_category && !s.parent_id

        let qty = 0
        if (isSelectedTopLevelCategory) {
          // Parent category: always count as 1 unit when selected,
          // even if it has no explicit price or time set.
          qty = 1
        } else if (s.question_type === 'checkbox') {
          qty = value ? 1 : 0
        } else {
          qty = typeof value === 'number' ? value : Number(value) || 0
        }

        return { ...s, qty }
      }),
    [allServicesFlat, form.items, selectedCategoryId],
  )

  const selectedServices = useMemo(() => rows.filter((s) => s.qty > 0), [rows])

  const regularCategory = useMemo(
    () => services.find((s) => s.category_type === 'regular_cleaning' && s.is_category),
    [services],
  )

  // Shared pricing rules: Regular Cleaning is hours × rate × cleaners, everything
  // else is qty × unit price. This summary therefore matches what we persist and
  // what Stripe charges (checkout re-prices the booking from the DB).
  const { subtotal, totalTime, regular } = useMemo(() => {
    const totals = computeBookingTotals(
      selectedServices.map((s) => ({
        service_id: s.id,
        qty: s.qty,
        unit_price: Number(s.price),
        time_minutes: s.time_minutes,
        name: s.name,
      })),
      allServicesFlat,
    )
    return {
      subtotal: totals.subtotal,
      totalTime: totals.totalTimeMinutes,
      regular: totals.regular,
    }
  }, [selectedServices, allServicesFlat])

  const total = Math.max(0, subtotal - (form.discount || 0))

  // Handle category selection - clear items from other categories and set defaults
  const handleCategoryChange = (categoryId: string) => {
    if (selectedCategoryId === categoryId) return

    const selectedCategory = allCategories.find((cat) => cat.id === categoryId)
    if (!selectedCategory) return

    // Collect all service IDs (parent + nested children) for other categories
    const otherCategories = allCategories.filter((cat) => cat.id !== categoryId)
    const otherServiceIds = new Set<string>()

    const collectIds = (svc: Service) => {
      otherServiceIds.add(svc.id)
      if (svc.children && svc.children.length > 0) {
        svc.children.forEach(collectIds)
      }
    }

    otherCategories.forEach(collectIds)

    // Clear items from other categories
    const updatedItems: Record<string, number | string> = { ...form.items }
    otherServiceIds.forEach((id) => {
      delete updatedItems[id]
    })

    // For Regular Cleaning, set cleaners to 1 by default
    if (selectedCategory.category_type === 'regular_cleaning' && selectedCategory.children) {
      const cleanersService = selectedCategory.children.find((s) => /cleaner/i.test(s.name))
      if (cleanersService && !updatedItems[cleanersService.id]) {
        updatedItems[cleanersService.id] = 1
      }
    }

    setForm((f) => ({
      ...f,
      items: updatedItems,
    }))
    setSelectedCategoryId(categoryId)
  }

  async function createDraftBooking() {
    // Validate required fields
    if (!form.firstName || !form.lastName || !form.phone) {
      toast.error('Please fill in customer name and phone')
      return
    }

    // For regular cleaning, check that both hours and cleaners are selected
    if (regularCategory && selectedCategoryId === regularCategory.id) {
      if (!regular) {
        toast.error('Please select number of hours and cleaners for regular cleaning')
        return
      }
    } else if (!selectedServices.length) {
      toast.error('Please select at least one service')
      return
    }

    setLoading(true)

    try {
      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          status: 'draft',
          source: 'admin',
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          address: form.address,
          city: form.city,
          postcode: form.postcode,
          phone: form.phone,
          frequency: form.frequency,
          service_date: form.serviceDate || null,
          arrival_window: form.arrivalWindow,
          discount: form.discount || 0,
          subtotal,
          total,
          total_time_minutes: totalTime,
          payment_status: 'pending',
          notes: form.notes,
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Create booking items
      let items: Array<any> = []

      // For regular cleaning, include hours and cleaners items (plus parent wrapper line)
      if (regular && regularCategory) {
        const hoursService = allServicesFlat.find((s) => s.id === regular.hoursServiceId)
        const cleanersService = allServicesFlat.find((s) => s.id === regular.cleanersServiceId)

        if (hoursService && cleanersService) {
          items.push(
            {
              booking_id: booking.id,
              service_id: hoursService.id,
              qty: regular.hours,
              unit_price: hoursService.price,
              time_minutes: hoursService.time_minutes,
            },
            {
              booking_id: booking.id,
              service_id: cleanersService.id,
              qty: regular.cleaners,
              unit_price: cleanersService.price,
              time_minutes: cleanersService.time_minutes,
            },
            {
              // Parent regular cleaning wrapper line (qty 1, zero-priced)
              booking_id: booking.id,
              service_id: regularCategory.id,
              qty: 1,
              unit_price: 0,
              time_minutes: 0,
            },
          )
        }
      } else {
        // For other services, use selectedServices
        items = selectedServices.map((s) => ({
          booking_id: booking.id,
          service_id: s.id,
          qty: s.qty,
          unit_price: s.price,
          time_minutes: s.time_minutes,
        }))
      }

      const { error: itemsError } = await supabase.from('booking_items').insert(items)

      if (itemsError) throw itemsError

      // Generate invoice if requested
      if (form.generateInvoice) {
        try {
          await adminFetch('/api/admin/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              subtotal,
              discount: form.discount || 0,
              total,
            }),
          })
        } catch {
          // Don't fail the booking creation if invoice fails
          toast.info('Booking created, but the invoice could not be generated')
        }
      }

      // If Stripe payment is requested, redirect to checkout
      if (form.processStripePayment) {
        const checkoutRes = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            customerEmail: form.email,
            customerName: `${form.firstName} ${form.lastName}`,
          }),
        })

        const checkoutData = await checkoutRes.json()

        if (checkoutRes.ok && checkoutData.url) {
          window.location.href = checkoutData.url
          return
        } else {
          throw new Error(checkoutData.error?.message || 'Failed to create checkout session')
        }
      }

      toast.success('Draft booking created')

      // Reset form
      setForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postcode: '',
        serviceDate: '',
        frequency: 'one_time',
        arrivalWindow: 'exact',
        items: {},
        notes: '',
        discount: 0,
        processStripePayment: false,
        generateInvoice: true,
      })

      window.location.href = `/admin/bookings/${booking.id}`
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const selectedCategory = selectedCategoryId
    ? allCategories.find((c) => c.id === selectedCategoryId) ?? null
    : null

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="grid h-max gap-5">
        <div>
          <h2 className="text-xl">Create booking</h2>
          <p className="mt-1 text-sm text-ink-soft">Fill in the details below to create a new booking</p>
        </div>

        {/* Customer information */}
        <SectionCard title="Customer information">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="input"
              placeholder="First name *"
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Last name *"
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
            />
          </div>
          <div className="mt-4 grid gap-4">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Phone *</label>
              <PhoneInput
                defaultCountry="GB"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v || '' }))}
                className="input"
                placeholder="Phone number"
              />
            </div>
          </div>
        </SectionCard>

        {/* Service location */}
        <SectionCard title="Service location">
          <div className="grid gap-4">
            <input
              className="input"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="input"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Postcode"
                value={form.postcode}
                onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
              />
            </div>
          </div>
        </SectionCard>

        {/* When */}
        <SectionCard title="When">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Service date</label>
              <input
                className="input"
                type="datetime-local"
                value={form.serviceDate}
                onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Frequency</label>
              <select
                className="input"
                value={form.frequency}
                onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as any }))}
              >
                <option value="one_time">One time</option>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Arrival window</label>
              <select
                className="input"
                value={form.arrivalWindow}
                onChange={(e) => setForm((f) => ({ ...f, arrivalWindow: e.target.value as any }))}
              >
                <option value="exact">Exact time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Discount (£)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: Number(e.target.value) }))}
              />
            </div>
          </div>
        </SectionCard>

        {/* Services selection */}
        <SectionCard title="Select services *">
          <div className="space-y-4">
            <p className="text-sm text-ink-soft">
              Choose one service category below, then configure the services for this booking.
            </p>

            {allCategories.length > 0 && (
              <CategoryPicker
                categories={allCategories}
                selectedId={selectedCategoryId}
                onSelect={handleCategoryChange}
              />
            )}

            {selectedCategory && (() => {
              const section = buildCategorySection(selectedCategory)
              return (
                <ServiceSection
                  key={selectedCategory.id}
                  title={selectedCategory.name}
                  description={section.description}
                  services={section.services}
                  items={form.items}
                  onItemChange={updateItem}
                  showExtrasLabel={section.showExtras}
                  extrasStartIndex={section.extrasStartIndex}
                  showPrices={false}
                />
              )
            })()}

            {services.length === 0 && (
              <div className="rounded-(--radius-card) border border-line p-4 text-center text-sm text-ink-soft">
                No services found. Check your services configuration.
              </div>
            )}
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Special instructions">
          <textarea
            className="input min-h-[100px]"
            placeholder="Add any notes or special instructions..."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </SectionCard>

        {/* Payment & invoice options */}
        <SectionCard title="Payment & invoice options">
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:border-accent/50">
              <input
                type="checkbox"
                checked={form.generateInvoice}
                onChange={(e) => setForm((f) => ({ ...f, generateInvoice: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-(--color-accent)"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Generate invoice</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Automatically create an invoice for this booking that can be viewed and printed later
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-(--radius-ctl) border border-line p-3.5 transition-colors duration-150 hover:border-accent/50">
              <input
                type="checkbox"
                checked={form.processStripePayment}
                onChange={(e) => setForm((f) => ({ ...f, processStripePayment: e.target.checked }))}
                className="mt-1 h-4 w-4 accent-(--color-accent)"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">Process Stripe payment</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Redirect to Stripe checkout page to process payment immediately (same as customer booking flow)
                </p>
              </div>
            </label>

            {form.processStripePayment && !form.email && (
              <div className="flex items-start gap-2.5 rounded-(--radius-ctl) bg-amber-50 p-3.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Email address is recommended for Stripe payment receipts
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        <button onClick={createDraftBooking} disabled={loading} className="btn-primary w-full py-3.5 text-base">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner />
              Creating booking…
            </span>
          ) : form.processStripePayment ? (
            'Create booking & process payment'
          ) : (
            'Create draft booking'
          )}
        </button>
      </div>

      {/* Summary sidebar */}
      <aside className="sticky top-24 h-max rounded-(--radius-card) border border-line bg-surface p-6 shadow-soft">
        <h3 className="text-base">Booking summary</h3>

        {selectedServices.length > 0 ? (
          <>
            <ul className="mt-4 space-y-3">
              {selectedServices.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                    <p className="text-xs text-ink-faint">Qty: {s.qty}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">£{(s.qty * s.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="font-medium text-ink">£{subtotal.toFixed(2)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between font-medium text-accent">
                  <span>Discount</span>
                  <span>-£{form.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-soft">Estimated time</span>
                <span className="font-medium text-ink">
                  {Math.floor(totalTime / 60)}h {totalTime % 60}m
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <span className="font-semibold text-ink">Total</span>
                <span className="font-display text-xl font-semibold text-accent-dark">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-(--radius-ctl) bg-accent-tint p-3.5">
              <p className="mb-2 text-xs font-semibold text-accent-dark">Booking options</p>
              <ul className="space-y-1.5 text-xs text-accent-dark/90">
                {form.generateInvoice && (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Invoice will be generated
                  </li>
                )}
                {form.processStripePayment ? (
                  <li className="flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" />
                    Will redirect to Stripe payment
                  </li>
                ) : (
                  <li className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Payment status: pending
                  </li>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-ink-soft">Select services to see summary</p>
          </div>
        )}
      </aside>
    </div>
  )
}
