'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
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
  const [selectedCleaningType, setSelectedCleaningType] = useState<'regular_cleaning' | 'deep_cleaning'>(
    'regular_cleaning',
  )

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

  // Calculate totals (similar to public booking page)
  const selectedServices = allServicesFlat
    .map((s) => {
      const value = form.items[s.id] ?? 0
      let qty = 0
      if (s.question_type === 'checkbox') {
        qty = value ? 1 : 0
      } else if (s.question_type === 'dropdown') {
        qty = typeof value === 'number' ? value : Number(value) || 0
      } else {
        qty = typeof value === 'number' ? value : Number(value) || 0
      }
      return { ...s, qty }
    })
    .filter((s) => s.qty > 0 && !s.is_category)

  const subtotal = selectedServices.reduce((sum, s) => sum + s.qty * Number(s.price), 0)
  const totalTime = selectedServices.reduce((sum, s) => sum + s.qty * s.time_minutes, 0)
  const total = Math.max(0, subtotal - (form.discount || 0))

  async function createDraftBooking() {
    if (!form.firstName || !form.lastName || !form.phone || !selectedServices.length) {
      alert('Please fill in customer name, phone, and select at least one service')
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
      const items = selectedServices.map((s) => ({
        booking_id: booking.id,
        service_id: s.id,
        qty: s.qty,
        unit_price: s.price,
        time_minutes: s.time_minutes,
      }))

      const { error: itemsError } = await supabase.from('booking_items').insert(items)

      if (itemsError) throw itemsError

      // Generate invoice if requested
      if (form.generateInvoice) {
        try {
          const invoiceRes = await fetch('/api/admin/invoices', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: booking.id,
              subtotal,
              discount: form.discount || 0,
              total,
            }),
          })

          if (invoiceRes.ok) {
            console.log('Invoice created successfully')
          }
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError)
          // Don't fail the booking creation if invoice fails
        }
      }

      // If Stripe payment is requested, redirect to checkout
      if (form.processStripePayment) {
        const checkoutItems = selectedServices.map((s) => ({
          service_id: s.id,
          name: s.name,
          qty: s.qty,
          unit_price: s.price,
          time_minutes: s.time_minutes,
        }))

        const checkoutRes = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: booking.id,
            items: checkoutItems,
            subtotal,
            discount: form.discount || 0,
            total,
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
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-2xl font-semibold mb-6">Create Manual Booking</h2>

        <div className="grid gap-4">
          {/* Customer Information */}
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Customer Information</h3>
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
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Service Location</h3>
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
          <div className="rounded-lg border p-4 bg-gray-50">
            <h3 className="font-semibold mb-3">Service Details</h3>
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
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Select Services *</h3>
            <div className="space-y-4">
              {/* Cleaning type selector */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Main cleaning type</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCleaningType('regular_cleaning')}
                    className={`text-left rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      selectedCleaningType === 'regular_cleaning'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <p className="font-semibold">Regular Cleaning</p>
                    <p className="text-xs mt-1 opacity-80">
                      Standard clean with flexible hours and cleaners.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCleaningType('deep_cleaning')}
                    className={`text-left rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      selectedCleaningType === 'deep_cleaning'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-white hover:border-blue-400'
                    }`}
                  >
                    <p className="font-semibold">Deep / End of Tenancy</p>
                    <p className="text-xs mt-1 opacity-80">
                      Intensive clean of rooms with optional extras.
                    </p>
                  </button>
                </div>
              </div>

              {/* Category groups similar to public booking form */}
              {(() => {
                const mainCategories = services.filter(
                  (s) => s.category_type === 'regular_cleaning' || s.category_type === 'deep_cleaning',
                )
                const otherCategories = services.filter(
                  (s) => s.category_type !== 'regular_cleaning' && s.category_type !== 'deep_cleaning',
                )

                const selectedMain = mainCategories.find((c) => c.category_type === selectedCleaningType)

                return (
                  <div className="space-y-4">
                    {/* Selected main category */}
                    {selectedMain && (
                      <ServiceSection
                        key={selectedMain.id}
                        title={selectedMain.name}
                        description={
                          selectedMain.category_type === 'regular_cleaning'
                            ? 'Select number of hours and cleaners needed'
                            : 'Select rooms to be deep cleaned and any extras'
                        }
                        services={
                          selectedMain.children && selectedMain.children.length > 0
                            ? selectedMain.children
                            : [selectedMain]
                        }
                        items={form.items}
                        onItemChange={updateItem}
                        showExtrasLabel={selectedMain.category_type === 'deep_cleaning'}
                        extrasStartIndex={selectedMain.category_type === 'deep_cleaning' ? 8 : 0}
                      />
                    )}

                    {/* Other categories (windows, gardening, etc.) */}
                    {otherCategories.map((category) => (
                      <ServiceSection
                        key={category.id}
                        title={category.name}
                        description={
                          category.category_type === 'windows'
                            ? 'Exterior window cleaning per square foot'
                            : category.category_type === 'gardening'
                            ? 'Select gardening services needed'
                            : ''
                        }
                        services={
                          category.children && category.children.length > 0 ? category.children : [category]
                        }
                        items={form.items}
                        onItemChange={updateItem}
                      />
                    ))}

                    {services.length === 0 && (
                      <div className="text-sm text-slate-600 p-4 text-center border rounded-xl">
                        No services found. Check your services configuration.
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Notes</label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Add any notes or special instructions..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Payment & Invoice Options */}
          <div className="rounded-lg border p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-semibold mb-3 text-gray-900">Payment & Invoice Options</h3>
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

          <button onClick={createDraftBooking} disabled={loading} className="btn-primary text-lg py-4">
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
      <aside className="bg-white rounded-2xl p-6 shadow-lg h-max sticky top-24">
        <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>

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
            <p className="text-sm text-gray-500">Select services to see summary</p>
          </div>
        )}
      </aside>
    </div>
  )
}
