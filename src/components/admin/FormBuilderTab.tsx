'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import type { FormConfig, Service } from '@/lib/types'

export default function FormBuilderTab() {
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [services, setServices] = useState<Service[]>([])

  async function load() {
    const [{ data: cfg }, { data: svcs }] = await Promise.all([
      supabase.from('form_configs').select('*').eq('active', true).single(),
      supabase.from('services').select('*').eq('active', true)
    ])
    if (cfg) setConfig(cfg as any)
    if (svcs) setServices(svcs as any)
  }
  useEffect(()=>{ load() }, [])

  if (!config) return <p>Loading…</p>

  const c = { ...config.config }
  function toggleService(id: string) {
    const set = new Set(c.allowed_services?.map((s:any)=>s.service_id))
    if (set.has(id)) c.allowed_services = (c.allowed_services||[]).filter((s:any)=>s.service_id!==id)
    else (c.allowed_services ||= []).push({ service_id: id, default_qty: 0 })
    setConfig({ ...config, config: c } as any)
  }
  function setDefaultQty(id: string, qty: number) {
    const found = (c.allowed_services||[]).find((s:any)=>s.service_id===id)
    if (found) found.default_qty = qty
    setConfig({ ...config, config: c } as any)
  }
  async function save() {
    await supabase.from('form_configs').update({ config: c }).eq('id', config!.id)
    await load()
    alert('Form saved. Public booking form will reflect these changes immediately.')
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">Booking Form Designer</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Base fields</p>
            <div className="mt-2 grid gap-1 text-sm">
              {['email','firstName','lastName','address','city','postcode','phone','serviceDate'].map(f=>(
                <label key={f} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={c.base_fields.includes(f)}
                    onChange={e=>{
                      if (e.target.checked) c.base_fields.push(f)
                      else c.base_fields = c.base_fields.filter((x:string)=>x!==f)
                      setConfig({ ...config, config: c } as any)
                    }}
                  />
                  {f}
                </label>
              ))}
            </div>

            <p className="text-sm font-medium mt-4">Frequencies</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['one_time','weekly','bi_weekly','monthly'] as const).map(f=>(
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input type="checkbox"
                    checked={c.frequencies.includes(f)}
                    onChange={e=>{
                      if (e.target.checked) c.frequencies.push(f)
                      else c.frequencies = c.frequencies.filter((x:any)=>x!==f)
                      setConfig({ ...config, config: c } as any)
                    }}/> {f.replace('_',' ')}
                </label>
              ))}
            </div>

            <p className="text-sm font-medium mt-4">Arrival windows</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {['exact','morning','afternoon'].map(w=>(
                <label key={w} className="flex items-center gap-2 text-sm">
                  <input type="checkbox"
                    checked={c.arrival_windows.includes(w)}
                    onChange={e=>{
                      if (e.target.checked) c.arrival_windows.push(w)
                      else c.arrival_windows = c.arrival_windows.filter((x:any)=>x!==w)
                      setConfig({ ...config, config: c } as any)
                    }}/> {w}
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Service selector type</p>
            <div className="mt-2">
              {(['quantities','checkboxes'] as const).map(t=>(
                <label key={t} className="mr-4 text-sm">
                  <input type="radio" name="selectorType" className="mr-2"
                    checked={c.service_selector===t}
                    onChange={()=>{ c.service_selector=t; setConfig({ ...config, config: c } as any) }} />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>

        <hr className="my-6" />

        <p className="text-sm font-medium mb-2">Allowed services & default quantities</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s=>{
            const selected = (c.allowed_services||[]).some((x:any)=>x.service_id===s.id)
            const current = (c.allowed_services||[]).find((x:any)=>x.service_id===s.id)
            return (
              <div key={s.id} className={`rounded-xl border p-3 ${selected?'border-brand-600':''}`}>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!selected} onChange={()=>toggleService(s.id)} />
                  <span className="font-medium">{s.name}</span>
                </label>
                <p className="text-xs text-slate-600 mt-1">£{Number(s.price).toFixed(2)} • {s.time_minutes} mins</p>
                {selected && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs">Default qty</span>
                    <input type="number" min={0} className="input"
                      value={current?.default_qty ?? 0}
                      onChange={e=>setDefaultQty(s.id, Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <button onClick={save} className="btn-primary">Save Form</button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">Create Booking (Admin)</h2>
        <p className="text-sm text-slate-600">Use the public “Book Now” flow on the site to simulate, or create in the Bookings tab—there you can set discounts & time overrides.</p>
      </div>
    </div>
  )
}
