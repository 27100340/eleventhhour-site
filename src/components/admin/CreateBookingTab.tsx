'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import { adminFetch } from '@/lib/admin-fetch'
import { computeBookingTotals } from '@/lib/pricing'
import type { Service } from '@/lib/types'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ServiceSection } from '@/components/booking/ServiceSection'

export default function CreateBookingTab() {
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
        } else if (s.question_type === 'dropdown') {
          qty = typeof value === 'number' ? value : Number(value) || 0
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
      alert('Please fill in customer name and phone')
      return
    }

    // For regular cleaning, check that both hours and cleaners are selected
    if (regularCategory && selectedCategoryId === regularCategory.id) {
      if (!regular) {
        alert('Please select number of hours and cleaners for regular cleaning')
        return
      }
    } else if (!selectedServices.length) {
      alert('Please select at least one service')
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
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          // Don't fail the booking creation if invoice fails
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

      alert(`Draft booking created successfully! ID: ${booking.id}`)

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
      console.error('Error creating booking:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
      <div className="rounded-2xl border-2 border-brand-stone bg-white p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-brand-charcoal mb-1">Create Booking</h2>
          <p className="text-sm text-gray-600">Fill in the details below to create a new booking</p>
        </div>

        <div className="grid gap-6">
          {/* Customer Information */}
          <div className="rounded-2xl border-2 border-brand-stone bg-brand-amber/5 p-5">
            <h3 className="font-bold text-lg text-brand-charcoal mb-4">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
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
            <div className="grid gap-4 mt-4">
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Phone *</label>
                <PhoneInput
                  defaultCountry="GB"
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v || '' }))}
                  className="input"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Service Location */}
          <div className="rounded-2xl border-2 border-brand-stone bg-brand-amber/5 p-5">
            <h3 className="font-bold text-lg text-brand-charcoal mb-4">Service Location</h3>
            <div className="grid gap-4">
              <input
                className="input"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
              <div className="grid md:grid-cols-2 gap-4">
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
          </div>

          {/* Service Details */}
          <div className="rounded-2xl border-2 border-brand-stone bg-brand-amber/5 p-5">
            <h3 className="font-bold text-lg text-brand-charcoal mb-4">When & Where</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Service Date</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.serviceDate}
                  onChange={(e) => setForm((f) => ({ ...f, serviceDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Frequency</label>
                <select
                  className="input"
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as any }))}
                >
                  <option value="one_time">One Time</option>
                  <option value="weekly">Weekly</option>
                  <option value="bi_weekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Arrival Window</label>
                <select
                  className="input"
                  value={form.arrivalWindow}
                  onChange={(e) => setForm((f) => ({ ...f, arrivalWindow: e.target.value as any }))}
                >
                  <option value="exact">Exact Time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Discount (£)</label>
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
          </div>

          {/* Services Selection */}
          <div className="rounded-2xl border-2 border-brand-stone bg-white p-5">
            <h3 className="font-bold text-lg text-brand-charcoal mb-4">Select Services *</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Choose one service category below, then configure the services for this booking.
              </p>

              {allCategories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-brand-charcoal mb-2">Service Categories (select one)</p>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {allCategories.map((category) => {
                      const isSelected = selectedCategoryId === category.id
                      const categoryIcons: Record<string, string> = {
                        regular_cleaning: '🧹',
                        deep_cleaning: '🧼',
                        end_of_tenancy: '📦',
                        windows: '🪟',
                        gardening: '🌿',
                        landscaping: '🌳',
                        handyman: '🛠️',
                        waste_removal: '🗑️',
                      }
                      const icon = categoryIcons[category.category_type || ''] || '📋'

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleCategoryChange(category.id)}
                          className={`text-left rounded-2xl border-2 px-4 py-3 text-sm transition-all ${
                            isSelected
                              ? 'border-brand-amber bg-brand-amber/10 ring-2 ring-brand-amber/40'
                              : 'border-slate-200 bg-white hover:border-brand-amber/60 hover:bg-brand-amber/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{icon}</span>
                            <p className="font-semibold">{category.name}</p>
                          </div>
                          {isSelected && (
                            <p className="text-xs text-brand-amber font-medium">Selected</p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {selectedCategoryId && allCategories.length > 0 && (() => {
                  const selectedCategory = allCategories.find(
                    (c) => c.id === selectedCategoryId,
                  )
                  if (!selectedCategory) return null

                  const childServices = selectedCategory.children || []
                  const showExtras =
                    selectedCategory.category_type === 'deep_cleaning' ||
                    selectedCategory.category_type === 'end_of_tenancy'
                  const extrasStartIndex = showExtras ? 8 : 0

                  const getDescription = () => {
                    switch (selectedCategory.category_type) {
                      case 'regular_cleaning':
                        return 'Select number of hours and cleaners needed'
                      case 'deep_cleaning':
                      case 'end_of_tenancy':
                        return 'Select rooms to be cleaned and any extras'
                      case 'windows':
                        return 'Exterior window cleaning - enter square footage'
                      case 'gardening':
                        return 'Select gardening services needed'
                      case 'landscaping':
                        return 'Professional landscaping services'
                      case 'handyman':
                        return 'Handyman services for this booking'
                      case 'waste_removal':
                        return 'Waste and junk removal services'
                      default:
                        return 'Configure services for this category'
                    }
                  }

                  const servicesForSection: Service[] = []

                  if (selectedCategory.price > 0 || selectedCategory.time_minutes > 0) {
                    servicesForSection.push(selectedCategory)
                    // Don't add children here - NestedServiceSelector will handle them when expanded
                  } else if (childServices.length > 0) {
                    // If parent has no price/time, add children directly
                    servicesForSection.push(...childServices)
                  }

                  if (servicesForSection.length === 0) {
                    servicesForSection.push(selectedCategory)
                  }

                  return (
                    <ServiceSection
                      key={selectedCategory.id}
                      title={selectedCategory.name}
                      description={getDescription()}
                      services={servicesForSection}
                      items={form.items}
                      onItemChange={updateItem}
                      showExtrasLabel={showExtras}
                      extrasStartIndex={
                        showExtras && servicesForSection[0]?.id === selectedCategory.id ? 1 : extrasStartIndex
                      }
                      showPrices={false}
                    />
                  )
                })()}

                {services.length === 0 && (
                  <div className="text-sm text-slate-600 p-4 text-center border rounded-xl">
                    No services found. Check your services configuration.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border-2 border-brand-stone bg-brand-amber/5 p-5">
            <label className="text-sm font-semibold text-brand-charcoal mb-2 block">Special Instructions</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Add any notes or special instructions..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Payment & Invoice Options */}
          <div className="rounded-2xl border-2 border-brand-stone bg-gradient-to-r from-brand-amber/10 to-brand-amber/5 p-5">
            <h3 className="font-bold text-lg text-brand-charcoal mb-4">Payment & Invoice Options</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-white border hover:border-blue-400 transition-colors">
                <input
                  type="checkbox"
                  checked={form.generateInvoice}
                  onChange={(e) => setForm((f) => ({ ...f, generateInvoice: e.target.checked }))}
                  className="mt-1 w-5 h-5 accent-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Generate Invoice</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Automatically create an invoice for this booking that can be viewed and printed later
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg bg-white border hover:border-green-400 transition-colors">
                <input
                  type="checkbox"
                  checked={form.processStripePayment}
                  onChange={(e) => setForm((f) => ({ ...f, processStripePayment: e.target.checked }))}
                  className="mt-1 w-5 h-5 accent-green-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Process Stripe Payment</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Redirect to Stripe checkout page to process payment immediately (same as customer booking flow)
                  </p>
                </div>
              </label>

              {form.processStripePayment && !form.email && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Email address is recommended for Stripe payment receipts
                  </p>
                </div>
              )}
            </div>
          </div>

          <button onClick={createDraftBooking} disabled={loading} className="w-full rounded-full bg-brand-amber text-white px-6 py-3 text-lg font-semibold hover:bg-brand-amber-dark disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating Booking...
              </span>
            ) : form.processStripePayment ? (
              'Create Booking & Process Payment'
            ) : (
              'Create Draft Booking'
            )}
          </button>
        </div>
      </div>

      {/* Summary Sidebar */}
      <aside className="bg-white rounded-2xl border-2 border-brand-stone p-6 shadow-lg h-max sticky top-24">
        <h3 className="text-lg font-bold text-brand-charcoal mb-4">Booking Summary</h3>

        {selectedServices.length > 0 ? (
          <>
            <div className="space-y-3 mb-6">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">Qty: {s.qty}</p>
                  </div>
                  <span className="text-sm font-semibold">£{(s.qty * s.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{subtotal.toFixed(2)}</span>
              </div>
              {form.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-£{form.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Time</span>
                <span className="font-medium">
                  {Math.floor(totalTime / 60)}h {totalTime % 60}m
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-blue-600">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 mb-2">
                <strong>Booking Options:</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1">
                {form.generateInvoice && (
                  <li className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Invoice will be generated
                  </li>
                )}
                {form.processStripePayment ? (
                  <li className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Will redirect to Stripe payment
                  </li>
                ) : (
                  <li className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Payment status: Pending
                  </li>
                )}
              </ul>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-600 font-medium">Select services to see summary</p>
          </div>
        )}
      </aside>
    </div>
  )
}
