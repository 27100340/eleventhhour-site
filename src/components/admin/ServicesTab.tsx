'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import type { Service } from '@/lib/types'

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<{
    name: string
    price: number
    time_minutes: number
    active: boolean
    order_index: number
    question_type: 'plus_minus' | 'checkbox' | 'dropdown'
    dropdown_options: { label: string; value: string | number }[]
  }>({
    name: '',
    price: 0,
    time_minutes: 0,
    active: true,
    order_index: 0,
    question_type: 'plus_minus',
    dropdown_options: []
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [newOptionValue, setNewOptionValue] = useState('')

  async function load() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true })
    if (!error && data) setServices(data as Service[])
  }
  useEffect(() => { load() }, [])

  function startEdit(s: Service) {
    setEditing(s)
    setForm({
      name: s.name,
      price: Number(s.price),
      time_minutes: s.time_minutes,
      active: s.active,
      order_index: s.order_index,
      question_type: s.question_type,
      dropdown_options: s.dropdown_options || []
    })
  }

  function reset() {
    setEditing(null)
    setForm({
      name: '',
      price: 0,
      time_minutes: 0,
      active: true,
      order_index: services.length,
      question_type: 'plus_minus',
      dropdown_options: []
    })
    setNewOptionLabel('')
    setNewOptionValue('')
  }

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

  // Drag and drop handlers
  function handleDragStart(index: number) {
    setDraggedIndex(index)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  async function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const reordered = [...services]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, draggedItem)

    // Update order_index for all items
    const updates = reordered.map((service, idx) => ({
      id: service.id,
      order_index: idx
    }))

    setServices(reordered)
    setDraggedIndex(null)

    // Save to database
    for (const update of updates) {
      await supabase.from('services').update({ order_index: update.order_index }).eq('id', update.id)
    }
  }

  function addDropdownOption() {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return
    setForm(f => ({
      ...f,
      dropdown_options: [...f.dropdown_options, { label: newOptionLabel, value: newOptionValue }]
    }))
    setNewOptionLabel('')
    setNewOptionValue('')
  }

  function removeDropdownOption(index: number) {
    setForm(f => ({
      ...f,
      dropdown_options: f.dropdown_options.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">All Services (Drag to Reorder)</h2>
        <p className="text-sm text-gray-600 mb-4">Drag and drop services to change their order in the booking form</p>
        <div className="divide-y">
          {services.map((s, index) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e)}
              onDrop={(e) => handleDrop(e, index)}
              className={`py-3 flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-slate-600">
                    £{Number(s.price).toFixed(2)} · {s.time_minutes} mins · {s.question_type} · {s.active ? 'Active' : 'Hidden'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100">
                  Edit
                </button>
                <button onClick={() => remove(s.id)} className="rounded-full border px-3 py-1 text-sm text-red-700 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="text-sm text-slate-600">No services yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">{editing ? 'Edit Service' : 'Add Service'}</h2>
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Price (£)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
          />
          <input
            className="input"
            placeholder="Time (minutes)"
            type="number"
            value={form.time_minutes}
            onChange={e => setForm(f => ({ ...f, time_minutes: Number(e.target.value) }))}
          />

          {/* Question Type Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Question Type</label>
            <select
              className="input"
              value={form.question_type}
              onChange={e => setForm(f => ({ ...f, question_type: e.target.value as any }))}
            >
              <option value="plus_minus">Plus/Minus (Quantity)</option>
              <option value="checkbox">Checkbox (Yes/No)</option>
              <option value="dropdown">Dropdown (Options)</option>
            </select>
          </div>

          {/* Dropdown Options (only show if dropdown type) */}
          {form.question_type === 'dropdown' && (
            <div className="border rounded-lg p-3 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Dropdown Options</label>

              {/* Existing options */}
              <div className="space-y-2 mb-3">
                {form.dropdown_options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                    <span className="text-sm flex-1">{opt.label} ({opt.value})</span>
                    <button
                      type="button"
                      onClick={() => removeDropdownOption(idx)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {form.dropdown_options.length === 0 && (
                  <p className="text-xs text-gray-500">No options added yet</p>
                )}
              </div>

              {/* Add new option */}
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="input text-sm"
                  value={newOptionLabel}
                  onChange={e => setNewOptionLabel(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="input text-sm"
                  value={newOptionValue}
                  onChange={e => setNewOptionValue(e.target.value)}
                />
                <button
                  type="button"
                  onClick={addDropdownOption}
                  className="rounded-full border px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
            />
            Active
          </label>

          <div className="flex gap-2">
            <button onClick={save} className="btn-primary">
              {editing ? 'Save' : 'Add'}
            </button>
            {editing && (
              <button onClick={reset} className="rounded-full border px-4 py-3">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
