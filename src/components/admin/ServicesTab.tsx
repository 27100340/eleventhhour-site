'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import type { Service } from '@/lib/types'

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState({ name:'', price:0, time_minutes:0, active:true })

  async function load() {
    const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false })
    if (!error && data) setServices(data as any)
  }
  useEffect(()=>{ load() }, [])

  function startEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, price: Number(s.price), time_minutes: s.time_minutes, active: s.active })
  }
  function reset() { setEditing(null); setForm({ name:'', price:0, time_minutes:0, active:true }) }

  async function save() {
    if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(form as any)
    }
    reset()
    await load()
  }
  async function remove(id: string) {
    if (!confirm('Delete this service?')) return
    await supabase.from('services').delete().eq('id', id)
    await load()
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">All Services</h2>
        <div className="divide-y">
          {services.map(s => (
            <div key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-slate-600">£{Number(s.price).toFixed(2)} · {s.time_minutes} mins · {s.active ? 'Active':'Hidden'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>startEdit(s)} className="rounded-full border px-3 py-1 text-sm">Edit</button>
                <button onClick={()=>remove(s.id)} className="rounded-full border px-3 py-1 text-sm text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {services.length===0 && <p className="text-sm text-slate-600">No services yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">{editing ? 'Edit Service' : 'Add Service'}</h2>
        <div className="grid gap-3">
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm(f=>({...f, name: e.target.value}))} />
          <input className="input" placeholder="Price (£)" type="number" step="0.01" value={form.price} onChange={e=>setForm(f=>({...f, price: Number(e.target.value)}))} />
          <input className="input" placeholder="Time (minutes)" type="number" value={form.time_minutes} onChange={e=>setForm(f=>({...f, time_minutes: Number(e.target.value)}))} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f, active: e.target.checked}))} />
            Active
          </label>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary">{editing ? 'Save' : 'Add'}</button>
            {editing && <button onClick={reset} className="rounded-full border px-4 py-3">Cancel</button>}
          </div>
        </div>
      </div>
    </div>
  )
}
