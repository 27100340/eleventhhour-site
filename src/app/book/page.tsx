'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import jsPDF from 'jspdf'

type Service = { id: string; name: string; price: number; time_minutes: number }
type Allowed = { service_id?: string; serviceId?: string; default_qty?: number }
type FormConfig = {
  base_fields: string[] // email, first_name, last_name, name, phone, address, city, postcode
  arrival_windows: string[]
  frequencies: Array<'one_time' | 'weekly' | 'bi_weekly' | 'monthly'>
  service_selector: 'quantities' | 'checkboxes'
  allowed_services?: Allowed[]
}
type Values = {
  email?: string
  firstName?: string
  lastName?: string
  address?: string
  city?: string
  postcode?: string
  phone?: string
  frequency: 'one_time' | 'weekly' | 'bi_weekly' | 'monthly'
  serviceDate?: string
  arrivalWindow?: 'exact' | 'morning' | 'afternoon'
  items: Record<string, number>
  notes?: string
}

const SILENT_FORM_RAW = process.env.NEXT_PUBLIC_FORMSPREE_SILENT_ID || ''
const CONTACT_FORM_RAW = process.env.NEXT_PUBLIC_FORMSPREE_CONTACT_ID || ''
const toFs = (raw: string) => (raw ? (/^https?:\/\//i.test(raw) ? raw : `https://formspree.io/f/${raw}`) : '')
const SILENT_ENDPOINT = toFs(SILENT_FORM_RAW)
const CONTACT_ENDPOINT = toFs(CONTACT_FORM_RAW)

function joinCompact(...parts: (string | undefined)[]) {
  return parts.filter(Boolean).join(' • ')
}

export default function BookPage() {
  const [services, setServices] = useState<Service[]>([])
  const [cfg, setCfg] = useState<FormConfig | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [done, setDone] = useState<{ id: string; total: number } | null>(null)

  const { handleSubmit, setValue, watch, getValues, register } = useForm<Values>({
    mode: 'onChange',
    defaultValues: { items: {}, frequency: 'one_time', arrivalWindow: 'exact' },
  })

  const has = (k: string) => !!cfg?.base_fields?.includes(k)
  const hasNamePair = has('first_name') || has('last_name') || has('name')

  // Load services + form config (no-cache + cache-bust)
  useEffect(() => {
    ;(async () => {
      const bust = Date.now()
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/public/services?v=${bust}`, { cache: 'no-store' as RequestCache }).then((r) => r.json()),
        fetch(`/api/public/form?v=${bust}`, { cache: 'no-store' as RequestCache }).then((r) => r.json()),
      ])

      const svc: Service[] = sRes?.data || []
      setServices(svc)

      // safe defaults if admin row is missing or malformed
      const c: FormConfig | null =
        (cRes?.data?.config as FormConfig) ?? {
          base_fields: ['email', 'first_name', 'last_name', 'phone', 'address', 'city', 'postcode'],
          arrival_windows: ['exact', 'morning', 'afternoon'],
          frequencies: ['one_time', 'weekly', 'bi_weekly', 'monthly'],
          service_selector: 'quantities',
          allowed_services: [],
        }
      setCfg(c)

      // Seed default qtys only if admin specified allowed services
      if (c?.allowed_services?.length) {
        const def: Record<string, number> = {}
        for (const a of c.allowed_services) {
          const id = (a.service_id || a.serviceId) as string | undefined
          if (id) def[id] = a.default_qty ?? 0
        }
        setValue('items', def, { shouldDirty: false })
      }
    })()
  }, [setValue])

  // Build allowed set; if none given → show ALL active services
  const allowedIds = useMemo(() => {
    const arr = cfg?.allowed_services || []
    const ids = arr
      .map((a) => (a.service_id || (a as any).serviceId) as string | undefined)
      .filter(Boolean) as string[]
    return ids.length ? new Set(ids) : null
  }, [cfg])

  const items = watch('items')
  const rows = useMemo(
    () =>
      services
        .filter((s) => !allowedIds || allowedIds.has(s.id)) // fallback: all services when admin list is empty
        .map((s) => ({ ...s, qty: items?.[s.id] ?? 0 })),
    [services, allowedIds, items],
  )

  // Totals
  const subtotal = rows.reduce((sum, r) => sum + (r.qty || 0) * Number(r.price), 0)
  const totalTime = rows.reduce((sum, r) => sum + (r.qty || 0) * r.time_minutes, 0)

  function setQty(id: string, qty: number) {
    const safe = Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0
    const current = getValues('items') || {}
    const next = { ...current, [id]: safe }
    setValue('items', next, { shouldDirty: true, shouldValidate: true })
  }

  // ---------- SILENT CAPTURE ON STEP ADVANCE (email optional) ----------
  const sentOnceRef = useRef(false)
  async function triggerSilentCaptureOnce() {
    if (sentOnceRef.current || !SILENT_ENDPOINT) return

    const email = (getValues('email') || '').trim() || undefined
    const first = (getValues('firstName') || '').trim() || undefined
    const last = (getValues('lastName') || '').trim() || undefined
    const phoneRaw = (getValues('phone') || '').trim()

    // Require phone only if phone field is enabled
    if (has('phone') && !phoneRaw) return

    let e164 = phoneRaw
    try {
      const parsed = parsePhoneNumber(phoneRaw)
      if (parsed) e164 = parsed.number
    } catch {
      // keep raw phone
    }

    const fd = new FormData()
    const name = [first, last].filter(Boolean).join(' ').trim() || '(no name yet)'
    fd.append('Name', name)
    if (email) fd.append('Email', email)
    if (phoneRaw) fd.append('Phone', e164)
    fd.append('_subject', 'New phone captured from booking form')
    fd.append('Source', 'booking-step-1')

    try {
      const resp = await fetch(SILENT_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: fd,
      })
      if (resp.ok) sentOnceRef.current = true
    } catch {
      // ignore; non-blocking
    }
  }

  async function goToStep2() {
    // Validate only fields that are visible on Step 1
    const missing: string[] = []
    if (has('email') && !(getValues('email') || '').trim()) missing.push('Email')
    if ((has('first_name') || has('name')) && !(getValues('firstName') || '').trim()) missing.push('First name')
    if ((has('last_name') || has('name')) && !(getValues('lastName') || '').trim()) missing.push('Last name')
    if (has('phone') && !(getValues('phone') || '').trim()) missing.push('Phone')

    if (missing.length) {
      alert(`Please fill: ${missing.join(', ')}`)
      return
    }

    await triggerSilentCaptureOnce()
    setStep(2)
  }

  // Submit handler: only require fields that are visible in Step 2
  async function onSubmit(v: Values) {
    const missing: string[] = []
    if (has('address') && !(v.address || '').trim()) missing.push('Address')
    if (has('city') && !(v.city || '').trim()) missing.push('City')
    if (has('postcode') && !(v.postcode || '').trim()) missing.push('Postcode')
    if (has('phone') && !(v.phone || '').trim()) missing.push('Phone')
    // email optional if hidden — don’t require

    const chosen = rows.filter((r) => r.qty > 0)
    if (!chosen.length) missing.push('At least one service')

    if (missing.length) {
      alert(`Please complete: ${missing.join(', ')}`)
      return
    }

    const payload = {
      ...v,
      subtotal,
      total: subtotal,
      total_time_minutes: totalTime,
      items: chosen.map((r) => ({
        service_id: r.id,
        qty: r.qty,
        unit_price: r.price,
        time_minutes: r.time_minutes,
      })),
    }

    const res = await fetch('/api/public/booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) {
      alert(data?.error?.message || data?.error?.hint || data?.error?.details || 'Could not save booking.')
      return
    }

    if (CONTACT_ENDPOINT) {
      try {
        const fd = new FormData()
        fd.append('Subject', 'New booking request')
        fd.append('Name', `${v.firstName || ''} ${v.lastName || ''}`.trim())
        if (v.email) fd.append('Email', v.email)
        if (v.phone) fd.append('Phone', v.phone)
        fd.append('Location', joinCompact(v.postcode, v.city))
        fd.append('Total', `£${subtotal.toFixed(2)}`)
        await fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
      } catch {}
    }

    setDone({ id: data.booking?.id || data.bookingId || '', total: subtotal })
    setStep(3)
  }

  // PDF
  function downloadQuote() {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('EleventhHour Cleaning Services', 20, 20)
    doc.setFontSize(11)
    doc.text('Estimated Quote', 20, 30)
    const fn = (watch('firstName') || '') + ' ' + (watch('lastName') || '')
    const name = fn.trim()
    if (name) doc.text(`Name: ${name}`, 20, 40)
    const emailVal = watch('email') || ''
    if (emailVal) doc.text(`Email: ${emailVal}`, 20, 48)
    const phoneVal = watch('phone') || ''
    if (phoneVal) doc.text(`Phone: ${phoneVal}`, 20, 56)
    const addr = [watch('address') || '', watch('city') || '', watch('postcode') || ''].filter(Boolean).join(', ')
    if (addr) doc.text(`Address: ${addr}`, 20, 64)
    doc.text('Items:', 20, 74)
    let y = 82
    rows
      .filter((r) => r.qty > 0)
      .forEach((r) => {
        doc.text(`- ${r.name} x${r.qty} · £${(r.qty * r.price).toFixed(2)} · ${r.qty * r.time_minutes} mins`, 22, y)
        y += 8
      })
    doc.text(`Subtotal: £${subtotal.toFixed(2)}`, 20, y + 8)
    doc.text(`Estimated time: ${totalTime} mins`, 20, y + 16)
    doc.save('eleventhhour-estimate.pdf')
  }

  if (!cfg) return <div className="mx-auto max-w-3xl px-4 py-10">Loading…</div>

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 grid lg:grid-cols-[2fr_1fr] gap-8">
      <div>
        <h1 className="text-3xl font-bold">Book Now</h1>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="mt-6 grid gap-4">
            {has('email') && <input className="input" type="email" placeholder="Email" {...register('email')} />}
            {(hasNamePair) && (
              <div className="grid md:grid-cols-2 gap-4">
                {(has('first_name') || has('name')) && (
                  <input className="input" placeholder="First name" {...register('firstName')} />
                )}
                {(has('last_name') || has('name')) && (
                  <input className="input" placeholder="Last name" {...register('lastName')} />
                )}
              </div>
            )}
            {has('phone') && (
              <div className="grid md:grid-cols-[100px_1fr] items-center gap-4">
                <label className="text-sm text-slate-600">Phone</label>
                <PhoneInput
                  defaultCountry="GB"
                  value={watch('phone') as any}
                  onChange={(v) => setValue('phone', v || '', { shouldValidate: true })}
                  className="input"
                  placeholder="Phone number"
                />
              </div>
            )}
            <button onClick={goToStep2} className="btn-primary mt-2">Continue</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
            {has('address') && <input className="input" placeholder="Address" {...register('address')} />}
            <div className="grid md:grid-cols-3 gap-4">
              {has('city') && <input className="input" placeholder="City" {...register('city')} />}
              {has('postcode') && <input className="input" placeholder="Postcode" {...register('postcode')} />}
              <input className="input" type="datetime-local" {...register('serviceDate')} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <select className="input" {...register('frequency')}>
                {(cfg.frequencies || ['one_time']).map((f) => (
                  <option key={f} value={f}>{f.replace('_', ' ')}</option>
                ))}
              </select>
              <select className="input" {...register('arrivalWindow')}>
                {(cfg.arrival_windows || ['exact', 'morning', 'afternoon']).map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border p-4">
              <p className="font-medium mb-3">Services</p>
              <div className="grid md:grid-cols-2 gap-4">
                {rows.map((r) => (
                  <div key={r.id} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-full border w-8 h-8" onClick={() => setQty(r.id, r.qty - 1)}>-</button>
                      <input
                        type="number"
                        min={0}
                        className="input w-16 text-center"
                        value={r.qty}
                        onChange={(e) => setQty(r.id, Number(e.target.value))}
                      />
                      <button type="button" className="rounded-full border w-8 h-8" onClick={() => setQty(r.id, r.qty + 1)}>+</button>
                    </div>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-slate-600">£{Number(r.price).toFixed(2)} · {r.time_minutes} mins</p>
                    </div>
                  </div>
                ))}
                {rows.length === 0 && (
                  <div className="text-sm text-slate-600">No services available.</div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="rounded-full border px-6 py-3">Back</button>
              <button className="btn-primary">Submit Request</button>
            </div>
          </form>
        )}

        {/* STEP 3 */}
        {step === 3 && done && (
          <div className="mt-6 rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold">Thank you!</h2>
            <p className="mt-2">Our team will reach out to you shortly to finalise your booking.</p>
            <p className="mt-2 font-medium">Estimated total: £{done.total.toFixed(2)}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={downloadQuote} className="btn-primary">Download Estimate PDF</button>
            </div>
          </div>
        )}
      </div>

      {/* Live receipt */}
      <aside className="rounded-2xl border p-4 h-max sticky top-20">
        <p className="font-semibold">Your Estimate</p>
        <div className="mt-3 space-y-2">
          {rows
            .filter((r) => r.qty > 0)
            .map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span>{r.name} × {r.qty}</span>
                <span>£{(r.qty * r.price).toFixed(2)}</span>
              </div>
            ))}
          {rows.every((r) => r.qty === 0) && <p className="text-sm text-slate-600">Add services to see your total.</p>}
        </div>
        <hr className="my-3" />
        <div className="flex items-center justify-between"><span className="text-sm">Time</span><span className="font-medium">{totalTime} mins</span></div>
        <div className="flex items-center justify-between"><span className="text-sm">Subtotal</span><span className="font-semibold">£{subtotal.toFixed(2)}</span></div>
      </aside>
    </div>
  )
}
