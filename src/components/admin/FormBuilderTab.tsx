'use client'
import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-fetch'
import type { FormConfig, Service } from '@/lib/types'

type Config = FormConfig['config']

// Keys must match the base_fields values that src/app/book/page.tsx checks via has().
const BASE_FIELDS: { key: string; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'postcode', label: 'Postcode' },
  { key: 'phone', label: 'Phone' },
  { key: 'service_date', label: 'Service date' },
]

const FREQUENCIES: { key: Config['frequencies'][number]; label: string }[] = [
  { key: 'one_time', label: 'One time' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'bi_weekly', label: 'Bi weekly' },
  { key: 'monthly', label: 'Monthly' },
]

const ARRIVAL_WINDOWS: { key: string; label: string }[] = [
  { key: 'exact', label: 'Exact' },
  { key: 'morning', label: 'Morning' },
  { key: 'afternoon', label: 'Afternoon' },
]

function toggleValue<T>(list: T[] | undefined, value: T, checked: boolean): T[] {
  const current = list ?? []
  if (checked) return current.includes(value) ? current : [...current, value]
  return current.filter((x) => x !== value)
}

export default function FormBuilderTab() {
  const [config, setConfig] = useState<Config | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setError(null)
    const [formRes, servicesRes] = await Promise.all([
      adminFetch('/api/admin/form'),
      fetch('/api/public/services', { cache: 'no-store' }),
    ])

    const formJson = await formRes.json()
    if (!formRes.ok || formJson?.error) {
      setError(formJson?.error?.message || 'Failed to load form config')
    } else if (formJson?.data?.config) {
      setConfig(formJson.data.config as Config)
    }

    const servicesJson = await servicesRes.json()
    if (Array.isArray(servicesJson?.data)) setServices(servicesJson.data as Service[])
  }

  useEffect(() => {
    load()
  }, [])

  function patch(next: Partial<Config>) {
    setConfig((c) => (c ? { ...c, ...next } : c))
  }

  function toggleService(id: string) {
    setConfig((c) => {
      if (!c) return c
      const current = c.allowed_services ?? []
      return {
        ...c,
        allowed_services: current.some((s) => s.service_id === id)
          ? current.filter((s) => s.service_id !== id)
          : [...current, { service_id: id, default_qty: 0 }],
      }
    })
  }

  function setDefaultQty(id: string, qty: number) {
    setConfig((c) =>
      c
        ? {
            ...c,
            allowed_services: (c.allowed_services ?? []).map((s) =>
              s.service_id === id ? { ...s, default_qty: qty } : s,
            ),
          }
        : c,
    )
  }

  async function save() {
    if (!config) return
    setSaving(true)
    setError(null)
    try {
      const res = await adminFetch('/api/admin/form', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const json = await res.json()
      if (!res.ok || json?.error) {
        setError(json?.error?.message || 'Failed to save form')
        return
      }
      await load()
      alert('Form saved. Public booking form will reflect these changes immediately.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error while saving')
    } finally {
      setSaving(false)
    }
  }

  if (error && !config) return <p className="text-red-600 text-sm">{error}</p>
  if (!config) return <p>Loading…</p>

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">Booking Form Designer</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Base fields</p>
            <div className="mt-2 grid gap-1 text-sm">
              {BASE_FIELDS.map((f) => (
                <label key={f.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(config.base_fields ?? []).includes(f.key)}
                    onChange={(e) =>
                      patch({ base_fields: toggleValue(config.base_fields, f.key, e.target.checked) })
                    }
                  />
                  {f.label}
                </label>
              ))}
            </div>

            <p className="text-sm font-medium mt-4">Frequencies</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(config.frequencies ?? []).includes(f.key)}
                    onChange={(e) =>
                      patch({ frequencies: toggleValue(config.frequencies, f.key, e.target.checked) })
                    }
                  />
                  {f.label}
                </label>
              ))}
            </div>

            <p className="text-sm font-medium mt-4">Arrival windows</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {ARRIVAL_WINDOWS.map((w) => (
                <label key={w.key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={(config.arrival_windows ?? []).includes(w.key)}
                    onChange={(e) =>
                      patch({ arrival_windows: toggleValue(config.arrival_windows, w.key, e.target.checked) })
                    }
                  />
                  {w.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Service selector type</p>
            <div className="mt-2">
              {(['quantities', 'checkboxes'] as const).map((t) => (
                <label key={t} className="mr-4 text-sm">
                  <input
                    type="radio"
                    name="selectorType"
                    className="mr-2"
                    checked={config.service_selector === t}
                    onChange={() => patch({ service_selector: t })}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <p className="text-sm font-medium mb-2">Allowed services & default quantities</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => {
            const current = (config.allowed_services ?? []).find((x) => x.service_id === s.id)
            const selected = !!current
            return (
              <div key={s.id} className={`rounded-xl border p-3 transition-all duration-200 ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={selected} onChange={() => toggleService(s.id)} />
                  <span className="font-medium">{s.name}</span>
                </label>
                <p className="text-xs text-slate-600 mt-1">£{Number(s.price).toFixed(2)} • {s.time_minutes} mins</p>
                {selected && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs">Default qty</span>
                    <input type="number" min={0} className="input"
                      value={current?.default_qty ?? 0}
                      onChange={(e) => setDefaultQty(s.id, Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Form'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">Create Booking (Admin)</h2>
        <p className="text-sm text-slate-600">Use the public “Book Now” flow on the site to simulate, or create in the Bookings tab—there you can set discounts & time overrides.</p>
      </div>
    </div>
  )
}
