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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

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
    // email optional if hidden — don't require

    const chosen = rows.filter((r) => r.qty > 0)
    if (!chosen.length) missing.push('At least one service')

    if (missing.length) {
      alert(`Please complete: ${missing.join(', ')}`)
      return
    }

    setIsProcessingPayment(true)

    try {
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

      // Create booking in database
      const res = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data?.error?.message || data?.error?.hint || data?.error?.details || 'Could not save booking.')
        setIsProcessingPayment(false)
        return
      }

      const bookingId = data.booking?.id || data.bookingId || ''

      // Send notification email
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

      // Create Stripe checkout session
      const checkoutRes = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          items: chosen.map((r) => ({
            service_id: r.id,
            name: r.name,
            qty: r.qty,
            unit_price: r.price,
            time_minutes: r.time_minutes,
          })),
          total: subtotal,
          customerEmail: v.email,
          customerName: `${v.firstName || ''} ${v.lastName || ''}`.trim(),
        }),
      })

      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok) {
        alert(checkoutData?.error?.message || 'Failed to create checkout session.')
        setIsProcessingPayment(false)
        return
      }

      // Redirect to Stripe Checkout using the new method
      console.log('✅ Checkout session created successfully')
      console.log('🔄 Redirecting to Stripe checkout...')

      // Use the direct URL from the session instead of redirectToCheckout
      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        throw new Error('No checkout URL received from Stripe')
      }
    } catch (error: any) {
      console.error('Booking error:', error)
      const errorMsg = error?.message || 'An unexpected error occurred. Please try again.'
      alert(`Error: ${errorMsg}\n\nPlease check the console for more details.`)
      setIsProcessingPayment(false)
    }
  }

  // PDF
  async function downloadQuote() {
    const doc = new jsPDF()

    // Modern color palette matching site design
    const colors = {
      primary: '#2563eb',      // blue-600
      primaryDark: '#1d4ed8',  // blue-700
      gray900: '#111827',
      gray700: '#374151',
      gray600: '#4b5563',
      gray400: '#9ca3af',
      gray200: '#e5e7eb',
      gray100: '#f3f4f6',
      gray50: '#f9fafb',
      white: '#ffffff',
      green600: '#059669'
    }

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 }
    }

    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    // Header with gradient background effect
    const headerHeight = 45
    const primaryRgb = hexToRgb(colors.primary)
    const primaryDarkRgb = hexToRgb(colors.primaryDark)

    // Create gradient effect with multiple rectangles
    for (let i = 0; i < headerHeight; i++) {
      const ratio = i / headerHeight
      const r = Math.round(primaryRgb.r + (primaryDarkRgb.r - primaryRgb.r) * ratio)
      const g = Math.round(primaryRgb.g + (primaryDarkRgb.g - primaryRgb.g) * ratio)
      const b = Math.round(primaryRgb.b + (primaryDarkRgb.b - primaryRgb.b) * ratio)

      doc.setFillColor(r, g, b)
      doc.rect(0, i, pageWidth, 1, 'F')
    }

    // Load and add logo
    let logoAdded = false
    try {
      // Create a white rounded background for the logo
      doc.setFillColor(255, 255, 255, 0.95)
      doc.roundedRect(margin, 12, 35, 20, 3, 3, 'F')

      // Create a subtle border
      doc.setDrawColor(hexToRgb(colors.gray200).r, hexToRgb(colors.gray200).g, hexToRgb(colors.gray200).b)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, 12, 35, 20, 3, 3, 'S')

      // Try to load and add the actual logo
      const loadLogo = () => new Promise<string>((resolve, reject) => {
        const logoImg = new Image()
        logoImg.crossOrigin = 'anonymous'

        logoImg.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (ctx) {
            canvas.width = logoImg.width
            canvas.height = logoImg.height
            ctx.drawImage(logoImg, 0, 0)
            try {
              const logoBase64 = canvas.toDataURL('image/png')
              resolve(logoBase64)
            } catch (e) {
              reject(e)
            }
          } else {
            reject(new Error('Canvas context not available'))
          }
        }

        logoImg.onerror = () => reject(new Error('Logo failed to load'))
        logoImg.src = '/el_logo.png'
      })

      try {
        const logoBase64 = await loadLogo()
        doc.addImage(logoBase64, 'PNG', margin + 3, 14, 29, 16)
        logoAdded = true
      } catch (e) {
        // Logo loading failed, will add fallback below
      }

    } catch (e) {
      // Error in logo section
    }

    // Fallback logo design if actual logo couldn't be loaded
    if (!logoAdded) {
      // Create an elegant monogram design
      doc.setFillColor(hexToRgb(colors.primary).r, hexToRgb(colors.primary).g, hexToRgb(colors.primary).b)
      doc.circle(margin + 17.5, 22, 8, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('EH', margin + 17.5, 24, { align: 'center' })
    }

    // Company name and tagline
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('EleventhHour', margin + 45, 22)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Professional Home & Commercial Services', margin + 45, 28)

    // Contact info in header (right aligned)
    doc.setFontSize(8)
    doc.text('020 8000 0000', pageWidth - margin, 18, { align: 'right' })
    doc.text('hello@eleventhhour.co.uk', pageWidth - margin, 23, { align: 'right' })
    doc.text('Greater London & Surrounding Areas', pageWidth - margin, 28, { align: 'right' })

    // Document title section
    let currentY = headerHeight + 25
    doc.setTextColor(colors.gray900)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Service Estimate', margin, currentY)

    // Add current date
    doc.setFontSize(10)
    doc.setTextColor(colors.gray600)
    doc.setFont('helvetica', 'normal')
    const currentDate = new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    doc.text(`Generated on ${currentDate}`, pageWidth - margin, currentY, { align: 'right' })

    currentY += 20

    // Customer information section
    doc.setFillColor(hexToRgb(colors.gray50).r, hexToRgb(colors.gray50).g, hexToRgb(colors.gray50).b)
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 40, 4, 4, 'F')

    doc.setTextColor(colors.primary)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Customer Information', margin + 10, currentY + 12)

    const fn = (watch('firstName') || '') + ' ' + (watch('lastName') || '')
    const name = fn.trim()
    const emailVal = watch('email') || ''
    const phoneVal = watch('phone') || ''
    const addr = [watch('address') || '', watch('city') || '', watch('postcode') || ''].filter(Boolean).join(', ')

    doc.setTextColor(colors.gray900)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    let infoY = currentY + 20
    if (name) {
      doc.setFont('helvetica', 'bold')
      doc.text('Name:', margin + 10, infoY)
      doc.setFont('helvetica', 'normal')
      doc.text(name, margin + 35, infoY)
      infoY += 6
    }

    if (emailVal) {
      doc.setFont('helvetica', 'bold')
      doc.text('Email:', margin + 10, infoY)
      doc.setFont('helvetica', 'normal')
      doc.text(emailVal, margin + 35, infoY)
    }

    if (phoneVal) {
      doc.setFont('helvetica', 'bold')
      doc.text('Phone:', pageWidth/2 + 10, currentY + 20)
      doc.setFont('helvetica', 'normal')
      doc.text(phoneVal, pageWidth/2 + 35, currentY + 20)
    }

    if (addr) {
      doc.setFont('helvetica', 'bold')
      doc.text('Address:', pageWidth/2 + 10, currentY + 26)
      doc.setFont('helvetica', 'normal')
      // Split long addresses
      const maxWidth = pageWidth/2 - 50
      const addressLines = doc.splitTextToSize(addr, maxWidth)
      doc.text(addressLines, pageWidth/2 + 45, currentY + 26)
    }

    currentY += 55

    // Services section
    doc.setTextColor(colors.primary)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Selected Services', margin, currentY)
    currentY += 15

    // Services table header
    const tableStartY = currentY
    doc.setFillColor(hexToRgb(colors.gray100).r, hexToRgb(colors.gray100).g, hexToRgb(colors.gray100).b)
    doc.rect(margin, currentY, pageWidth - 2 * margin, 12, 'F')

    doc.setTextColor(colors.gray700)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Service', margin + 5, currentY + 8)
    doc.text('Qty', pageWidth - 100, currentY + 8)
    doc.text('Rate', pageWidth - 70, currentY + 8)
    doc.text('Time', pageWidth - 45, currentY + 8)
    doc.text('Total', pageWidth - margin - 5, currentY + 8, { align: 'right' })

    currentY += 12

    // Service items
    const selectedServices = rows.filter((r) => r.qty > 0)
    selectedServices.forEach((r, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        doc.setFillColor(hexToRgb(colors.gray50).r, hexToRgb(colors.gray50).g, hexToRgb(colors.gray50).b)
        doc.rect(margin, currentY, pageWidth - 2 * margin, 10, 'F')
      }

      doc.setTextColor(colors.gray900)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      // Service name (truncate if too long)
      const serviceNameMaxWidth = pageWidth - 130
      const serviceName = doc.splitTextToSize(r.name, serviceNameMaxWidth)[0]
      doc.text(serviceName, margin + 5, currentY + 7)

      doc.text(r.qty.toString(), pageWidth - 100, currentY + 7)
      doc.text(`£${r.price.toFixed(2)}`, pageWidth - 70, currentY + 7)
      doc.text(`${r.time_minutes}m`, pageWidth - 45, currentY + 7)
      doc.text(`£${(r.qty * r.price).toFixed(2)}`, pageWidth - margin - 5, currentY + 7, { align: 'right' })

      currentY += 10
    })

    // Add bottom border to table
    doc.setDrawColor(hexToRgb(colors.gray200).r, hexToRgb(colors.gray200).g, hexToRgb(colors.gray200).b)
    doc.line(margin, currentY, pageWidth - margin, currentY)

    currentY += 15

    // Summary section
    const summaryBoxY = currentY
    doc.setFillColor(hexToRgb(colors.gray50).r, hexToRgb(colors.gray50).g, hexToRgb(colors.gray50).b)
    doc.roundedRect(pageWidth - 120, currentY, 100, 35, 4, 4, 'F')

    doc.setTextColor(colors.gray700)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Estimated Time:', pageWidth - 115, currentY + 10)
    doc.text(`${Math.floor(totalTime / 60)}h ${totalTime % 60}m`, pageWidth - 25, currentY + 10, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(colors.primary)
    doc.text('Total Estimate:', pageWidth - 115, currentY + 25)
    doc.setFontSize(14)
    doc.text(`£${subtotal.toFixed(2)}`, pageWidth - 25, currentY + 25, { align: 'right' })

    currentY += 50

    // Important notes section
    doc.setTextColor(colors.gray700)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Important Notes:', margin, currentY)
    currentY += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const notes = [
      '• This is an estimate only. Final pricing may vary based on specific requirements.',
      '• All services include professional supplies and equipment.',
      '• Our team is fully insured and DBS-checked.',
      '• We offer a 100% satisfaction guarantee on all services.',
      '• Payment is due upon completion of services.'
    ]

    notes.forEach(note => {
      doc.text(note, margin, currentY)
      currentY += 5
    })

    // Footer
    const footerY = pageHeight - 25
    doc.setDrawColor(hexToRgb(colors.gray200).r, hexToRgb(colors.gray200).g, hexToRgb(colors.gray200).b)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    doc.setTextColor(colors.gray600)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('EleventhHour Professional Services', margin, footerY)
    doc.text(`Generated on ${new Date().toLocaleString('en-GB')}`, pageWidth - margin, footerY, { align: 'right' })

    // Save the PDF
    doc.save('eleventhhour-service-estimate.pdf')
  }

  if (!cfg) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started with professional service booking in just a few simple steps.
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="h-px bg-gray-300 w-8"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
            <div className="h-px bg-gray-300 w-8"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg">

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
              <button type="button" onClick={() => setStep(1)} className="rounded-full border px-6 py-3" disabled={isProcessingPayment}>Back</button>
              <button className="btn-primary" disabled={isProcessingPayment}>
                {isProcessingPayment ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
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
          <aside className="bg-white rounded-2xl p-6 shadow-lg h-max sticky top-24">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
              <p className="text-sm text-gray-600 mt-1">Review your selected services</p>
            </div>

            <div className="space-y-3 mb-6">
              {rows
                .filter((r) => r.qty > 0)
                .map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {r.qty}</p>
                    </div>
                    <span className="font-semibold text-gray-900">£{(r.qty * r.price).toFixed(2)}</span>
                  </div>
                ))}

              {rows.every((r) => r.qty === 0) && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Select services to see your estimate</p>
                </div>
              )}
            </div>

            {rows.some((r) => r.qty > 0) && (
              <>
                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estimated Time</span>
                    <span className="font-medium text-gray-900">{Math.ceil(totalTime / 60)}h {totalTime % 60}m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">£{subtotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> This is an estimate. Final pricing may vary based on specific requirements and will be confirmed before service.
                  </p>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
