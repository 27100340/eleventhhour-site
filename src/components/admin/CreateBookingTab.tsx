'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import type { Service } from '@/lib/types'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

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
  })

  useEffect(() => {
    loadServices()
  }, [])

  async function loadServices() {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('order_index', { ascending: true })
    if (data) setServices(data as Service[])
  }

  function setQty(id: string, qty: number) {
    const safe = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0
    setForm((f) => ({ ...f, items: { ...f.items, [id]: safe } }))
  }

  function toggleCheckbox(id: string) {
    setForm((f) => ({ ...f, items: { ...f.items, [id]: f.items[id] ? 0 : 1 } }))
  }

  function setDropdownValue(id: string, value: string | number) {
    setForm((f) => ({ ...f, items: { ...f.items, [id]: value } }))
  }

  // Calculate totals
  const selectedServices = services
    .map((s) => {
      const value = form.items[s.id] ?? 0
      let qty = 0
      if (s.question_type === 'checkbox') {
        qty = value ? 1 : 0
      } else {
        qty = typeof value === 'number' ? value : Number(value) || 0
      }
      return { ...s, qty }
    })
    .filter((s) => s.qty > 0)

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
      })

      // Redirect to booking detail page
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
            <div className="grid gap-3">
              {services.map((s) => {
                const value = form.items[s.id] ?? 0
                const qty = typeof value === 'number' ? value : Number(value) || 0

                if (s.question_type === 'checkbox') {
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!!value}
                        onChange={() => toggleCheckbox(s.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">£{Number(s.price).toFixed(2)} • {s.time_minutes} min</p>
                      </div>
                    </div>
                  )
                } else if (s.question_type === 'dropdown') {
                  return (
                    <div key={s.id} className="p-3 rounded-lg border">
                      <p className="font-medium mb-2">{s.name}</p>
                      <p className="text-xs text-gray-500 mb-2">£{Number(s.price).toFixed(2)} • {s.time_minutes} min</p>
                      <select
                        className="input w-full"
                        value={value || ''}
                        onChange={(e) => setDropdownValue(s.id, e.target.value)}
                      >
                        <option value="">Select an option</option>
                        {s.dropdown_options?.map((opt, idx) => (
                          <option key={idx} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                } else {
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full border w-8 h-8 hover:bg-gray-100"
                          onClick={() => setQty(s.id, qty - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          className="input w-16 text-center"
                          value={qty}
                          onChange={(e) => setQty(s.id, Number(e.target.value))}
                        />
                        <button
                          type="button"
                          className="rounded-full border w-8 h-8 hover:bg-gray-100"
                          onClick={() => setQty(s.id, qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">£{Number(s.price).toFixed(2)} • {s.time_minutes} min</p>
                      </div>
                    </div>
                  )
                }
              })}
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

          <button
            onClick={createDraftBooking}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Draft Booking'}
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
                <span className="font-medium">{Math.floor(totalTime / 60)}h {totalTime % 60}m</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-blue-600">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Draft Status:</strong> This booking will be created as a draft with payment pending.
                You can mark it as paid after receiving payment.
              </p>
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
