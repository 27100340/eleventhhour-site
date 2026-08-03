'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { parsePhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { ServiceSection } from '@/components/booking/ServiceSection'
import { useToast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import type { Service } from '@/lib/types'
import { computeBookingTotals } from '@/lib/pricing'
import { StepIndicator } from './components/StepIndicator'
import { DetailsStep } from './components/DetailsStep'
import { CategoryPicker } from './components/CategoryPicker'
import { DiscountBox } from './components/DiscountBox'
import { BookingSummary } from './components/BookingSummary'

type Allowed = { service_id?: string; serviceId?: string; default_qty?: number }
type FormConfig = {
  base_fields: string[] // email, first_name, last_name, name, phone, address, city, postcode, service_date
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
  items: Record<string, number | string>
  notes?: string
  acceptTerms?: boolean
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
  const toast = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [cfg, setCfg] = useState<FormConfig | null>(null)
  const [step, setStep] = useState<1 | 2>(1)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null)
  const [discountError, setDiscountError] = useState('')
  const [validatingDiscount, setValidatingDiscount] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const { handleSubmit, setValue, watch, getValues, register } = useForm<Values>({
    mode: 'onChange',
    defaultValues: { items: {}, frequency: 'one_time', arrivalWindow: 'exact' },
  })

  const has = (k: string) => !!cfg?.base_fields?.includes(k)

  // Load services + form config (no-cache + cache-bust)
  useEffect(() => {
    ;(async () => {
      const bust = Date.now()
      const [sRes, cRes] = await Promise.all([
        fetch(`/api/public/services?hierarchical=true&v=${bust}`, { cache: 'no-store' as RequestCache }).then((r) => r.json()),
        fetch(`/api/public/form?v=${bust}`, { cache: 'no-store' as RequestCache }).then((r) => r.json()),
      ])

      const svc: Service[] = sRes?.data || []
      setServices(svc)

      // safe defaults if admin row is missing or malformed
      const c: FormConfig | null =
        (cRes?.data?.config as FormConfig) ?? {
          base_fields: ['email', 'first_name', 'last_name', 'phone', 'address', 'city', 'postcode', 'service_date'],
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

    if (!ids.length) return null

    const idSet = new Set(ids)

    if (services.length) {
      const parentMap = new Map<string, string | null>()

      const buildParentMap = (nodes: Service[], parentId: string | null) => {
        nodes.forEach((node) => {
          parentMap.set(node.id, parentId)
          if (node.children && node.children.length > 0) {
            buildParentMap(node.children, node.id)
          }
        })
      }

      buildParentMap(services, null)

      ids.forEach((id) => {
        let parentId = parentMap.get(id) || null
        while (parentId) {
          if (!idSet.has(parentId)) {
            idSet.add(parentId)
          }
          parentId = parentMap.get(parentId) || null
        }
      })
    }

    return idSet
  }, [cfg, services])

  const items = watch('items')
  const acceptTerms = watch('acceptTerms')

  // Flatten hierarchical services for calculations
  const flatServices = useMemo(() => {
    const result: Service[] = []
    const flatten = (svc: Service) => {
      result.push(svc)
      if (svc.children) {
        svc.children.forEach(flatten)
      }
    }
    services.forEach(flatten)
    return result
  }, [services])

  // Get all services (flattened) with their quantities
  const rows = useMemo(
    () => {
      return flatServices
        .filter((s) => !allowedIds || allowedIds.has(s.id))
        .map((s) => {
          const value = items?.[s.id] ?? 0
          const isSelectedTopLevelCategory = selectedCategoryId === s.id && s.is_category && !s.parent_id

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
          return { ...s, qty, rawValue: value }
        })
    },
    [flatServices, allowedIds, items, selectedCategoryId],
  )

  // Memoized totals — shared pricing rules keep this identical to what the
  // server persists and what Stripe charges.
  const { subtotal, totalTime, discountAmount, total } = useMemo(() => {
    const totals = computeBookingTotals(
      rows
        .filter((r) => r.qty > 0)
        .map((r) => ({
          service_id: r.id,
          qty: r.qty,
          unit_price: Number(r.price),
          time_minutes: r.time_minutes,
          name: r.name,
        })),
      flatServices,
    )

    const discount = appliedDiscount?.discount_amount || 0

    return {
      subtotal: totals.subtotal,
      totalTime: totals.totalTimeMinutes,
      discountAmount: discount,
      total: Math.max(0, totals.subtotal - discount),
    }
  }, [rows, flatServices, appliedDiscount])

  // All top-level categories are mutually exclusive
  const allCategories = useMemo(() => {
    return services.filter((s) => s.is_category && !s.parent_id)
  }, [services])

  // Handle category selection - clear items from other categories
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
    const updatedItems: Record<string, number | string> = { ...items }
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

    setValue('items', updatedItems, { shouldDirty: true })
    setSelectedCategoryId(categoryId)
  }

  // Validate discount code
  async function validateDiscountCode() {
    if (!discountCode.trim()) {
      setDiscountError('Please enter a discount code')
      return
    }

    if (subtotal === 0) {
      setDiscountError('Please select services first')
      return
    }

    setValidatingDiscount(true)
    setDiscountError('')

    try {
      const res = await fetch('/api/public/validate-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: discountCode,
          orderAmount: subtotal,
        }),
      })

      const data = await res.json()

      if (data.valid) {
        setAppliedDiscount(data)
        setDiscountError('')
      } else {
        setAppliedDiscount(null)
        setDiscountError(data.error || 'Invalid discount code')
      }
    } catch {
      setDiscountError('Failed to validate discount code')
      setAppliedDiscount(null)
    } finally {
      setValidatingDiscount(false)
    }
  }

  function removeDiscount() {
    setDiscountCode('')
    setAppliedDiscount(null)
    setDiscountError('')
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
      toast.error(`Please fill: ${missing.join(', ')}`)
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

    // Check terms acceptance
    if (!v.acceptTerms) missing.push('You must accept the Terms and Services')

    if (missing.length) {
      toast.error(`Please complete: ${missing.join(', ')}`)
      return
    }

    setIsProcessingPayment(true)

    try {
      const payload = {
        ...v,
        subtotal,
        discount: discountAmount,
        total,
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
        toast.error(data?.error?.message || data?.error?.hint || data?.error?.details || 'Could not save booking.')
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
          fd.append('Total', `£${total.toFixed(2)}`)
          if (discountAmount > 0) {
            fd.append('Discount', `£${discountAmount.toFixed(2)} (${appliedDiscount.code})`)
          }
          await fetch(CONTACT_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
        } catch {}
      }

      // Create Stripe checkout session
      const checkoutRes = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          customerEmail: v.email,
          customerName: `${v.firstName || ''} ${v.lastName || ''}`.trim(),
        }),
      })

      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok) {
        toast.error(checkoutData?.error?.message || 'Failed to create checkout session.')
        setIsProcessingPayment(false)
        return
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url
      } else {
        throw new Error('No checkout URL received from Stripe')
      }
    } catch (error: any) {
      toast.error(error?.message || 'An unexpected error occurred. Please try again.')
      setIsProcessingPayment(false)
    }
  }

  if (!cfg) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8 text-accent" />
      </div>
    )
  }

  const selectedCategory = selectedCategoryId
    ? allCategories.find((c) => c.id === selectedCategoryId) ?? null
    : null

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow">Book online</p>
        <h1 className="mt-3">Book your service</h1>
        <p className="mt-4 text-lg text-ink-soft">
          Fill in your details, choose your service, and we&rsquo;ll handle the rest — 7 days a week.
        </p>
        <div className="mt-8">
          <StepIndicator current={step} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-10">
        <div className="rounded-(--radius-card) border border-line bg-surface p-6 md:p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <DetailsStep
              has={has}
              register={register}
              watch={watch}
              setValue={setValue}
              onContinue={goToStep2}
            />
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {has('address') && <input className="input" placeholder="Address" {...register('address')} />}
              <div className="grid gap-4 md:grid-cols-2">
                {has('city') && <input className="input" placeholder="City" {...register('city')} />}
                {has('postcode') && <input className="input" placeholder="Postcode" {...register('postcode')} />}
              </div>
              {has('service_date') && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Preferred date &amp; time</label>
                  <input className="input" type="datetime-local" {...register('serviceDate')} />
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Frequency</label>
                  <select className="input" {...register('frequency')}>
                    {(cfg.frequencies || ['one_time']).map((f) => (
                      <option key={f} value={f}>{f.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Arrival window</label>
                  <select className="input" {...register('arrivalWindow')}>
                    {(cfg.arrival_windows || ['exact', 'morning', 'afternoon']).map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Service selection */}
              <div className="mt-2 space-y-4 border-t border-line pt-6">
                <div>
                  <h3>Select your service</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Choose one service category below, then customise your selections.
                  </p>
                </div>

                {allCategories.length > 0 && (
                  <CategoryPicker
                    categories={allCategories}
                    selectedId={selectedCategoryId}
                    onSelect={handleCategoryChange}
                  />
                )}

                {selectedCategory && (() => {
                  const childServices = selectedCategory.children || []
                  const showExtras =
                    selectedCategory.category_type === 'deep_cleaning' ||
                    selectedCategory.category_type === 'end_of_tenancy'
                  const extrasStartIndex = showExtras ? 8 : 0

                  // Category-specific descriptions
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
                        return 'Handyman services for your property'
                      case 'waste_removal':
                        return 'Waste and junk removal services'
                      default:
                        return ''
                    }
                  }

                  // Build service array: include parent IF it has a price, then add children
                  const servicesForSection = []

                  if (selectedCategory.price > 0 || selectedCategory.time_minutes > 0) {
                    servicesForSection.push(selectedCategory)
                    // Children are rendered by NestedServiceSelector when expanded
                  } else if (childServices.length > 0) {
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
                      items={items || {}}
                      onItemChange={(serviceId, value) => {
                        setValue('items', { ...items, [serviceId]: value }, { shouldDirty: true })
                      }}
                      showExtrasLabel={showExtras}
                      extrasStartIndex={showExtras && servicesForSection[0]?.id === selectedCategory.id ? 1 : extrasStartIndex}
                      showPrices={false}
                      defaultExpandedNested={true}
                    />
                  )
                })()}

                {services.length === 0 && (
                  <div className="rounded-(--radius-card) border border-line p-6 text-center text-sm text-ink-soft">
                    No services available. Please contact us for assistance.
                  </div>
                )}
              </div>

              <DiscountBox
                discountCode={discountCode}
                onCodeChange={setDiscountCode}
                appliedDiscount={appliedDiscount}
                discountAmount={discountAmount}
                discountError={discountError}
                validating={validatingDiscount}
                onApply={validateDiscountCode}
                onRemove={removeDiscount}
              />

              {/* Terms & Services */}
              <div className="rounded-(--radius-card) border border-line bg-paper p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms || false}
                    onChange={(e) => setValue('acceptTerms', e.target.checked, { shouldValidate: true })}
                    className="mt-1 h-4 w-4 accent-(--color-accent)"
                    required
                  />
                  <span className="text-sm text-ink">
                    I accept the{' '}
                    <a href="/terms" target="_blank" className="font-medium text-accent hover:text-accent-dark">
                      Terms and Services
                    </a>
                    <span className="ml-1 text-red-700">*</span>
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary px-6 py-3"
                  disabled={isProcessingPayment}
                >
                  Back
                </button>
                <button className="btn-primary flex-1 py-3 text-base" disabled={isProcessingPayment}>
                  {isProcessingPayment ? (
                    <span className="flex items-center gap-2">
                      <Spinner />
                      Processing…
                    </span>
                  ) : (
                    'Proceed to payment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <BookingSummary
          rows={rows}
          subtotal={subtotal}
          discountAmount={discountAmount}
          discountCode={appliedDiscount?.code}
          total={total}
        />
      </div>
    </div>
  )
}
