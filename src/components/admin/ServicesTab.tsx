'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/browser'
import type { Service } from '@/lib/types'

type FormState = {
  name: string
  price: number
  time_minutes: number
  active: boolean
  order_index: number
  question_type: 'plus_minus' | 'checkbox' | 'dropdown'
  dropdown_options: { label: string; value: string | number }[]
  is_category: boolean
  parent_id: string | null
}

const emptyForm: FormState = {
  name: '',
  price: 0,
  time_minutes: 0,
  active: true,
  order_index: 0,
  question_type: 'plus_minus',
  dropdown_options: [],
  is_category: false,
  parent_id: null,
}

export default function ServicesTab() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newOptionLabel, setNewOptionLabel] = useState('')
  const [newOptionValue, setNewOptionValue] = useState('')

  async function load() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true })

    if (!error && data) {
      setServices(data as Service[])
      setForm((f) => ({ ...f, order_index: (data as Service[]).length }))
    }
  }

  useEffect(() => {
    load()
  }, [])

  function startEdit(s: Service) {
    setEditing(s)
    setForm({
      name: s.name,
      price: Number(s.price),
      time_minutes: s.time_minutes,
      active: s.active,
      order_index: typeof s.order_index === 'number' ? s.order_index : 0,
      question_type: s.question_type,
      dropdown_options: s.dropdown_options || [],
      is_category: !!s.is_category,
      parent_id: (s.parent_id as string | null) || null,
    })
  }

  function reset() {
    setEditing(null)
    setForm({
      ...emptyForm,
      order_index: services.length,
    })
    setNewOptionLabel('')
    setNewOptionValue('')
  }

  async function save() {
    const parent = form.parent_id ? services.find((s) => s.id === form.parent_id) : null
    const nesting_level =
      parent && typeof parent.nesting_level === 'number' ? (parent.nesting_level as number) + 1 : 0

    const baseCategory = editing?.category_type ?? null
    const category_type = parent ? parent.category_type : baseCategory
    const per_unit_type = editing?.per_unit_type ?? 'item'

    const payload: any = {
      name: form.name,
      price: form.price,
      time_minutes: form.time_minutes,
      active: form.active,
      order_index: form.order_index,
      question_type: form.question_type,
      dropdown_options: form.dropdown_options,
      is_category: form.is_category,
      parent_id: form.parent_id,
      category_type,
      per_unit_type,
      nesting_level,
    }

    if (editing) {
      await supabase.from('services').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(payload)
    }

    await load()
    reset()
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

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>, dropIndex: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const reordered = [...services]
    const [draggedItem] = reordered.splice(draggedIndex, 1)
    reordered.splice(dropIndex, 0, draggedItem)

    const updates = reordered.map((service, idx) => ({
      id: service.id,
      order_index: idx,
    }))

    setServices(reordered)
    setDraggedIndex(null)

    for (const update of updates) {
      await supabase.from('services').update({ order_index: update.order_index }).eq('id', update.id)
    }
  }

  function addDropdownOption() {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return
    setForm((f) => ({
      ...f,
      dropdown_options: [...f.dropdown_options, { label: newOptionLabel, value: newOptionValue }],
    }))
    setNewOptionLabel('')
    setNewOptionValue('')
  }

  function removeDropdownOption(index: number) {
    setForm((f) => ({
      ...f,
      dropdown_options: f.dropdown_options.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      {/* Left: list of services */}
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">All Services (Drag to Reorder)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop services to change their order in the booking form
        </p>
        <div className="divide-y">
          {services.map((s, index) => {
            const parent = s.parent_id ? services.find((p) => p.id === s.parent_id) : null

            return (
              <div
                key={s.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`py-3 flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                <div
                  className="flex items-center gap-3"
                  style={{ marginLeft: ((s.nesting_level as number | undefined) || 0) * 12 }}
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-slate-600">
                      £{Number(s.price).toFixed(2)} • {s.time_minutes} min • {s.question_type} •{' '}
                      {s.active ? 'Active' : 'Hidden'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {s.is_category ? 'Category' : 'Service'}
                      {s.category_type && ` • ${String(s.category_type).replace('_', ' ')}`}
                      {parent && ` • Child of ${parent.name}`}
                      {s.per_unit_type && s.per_unit_type !== 'item' && ` • per ${s.per_unit_type}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(s.id)}
                    className="rounded-full border px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
          {services.length === 0 && <p className="text-sm text-slate-600">No services yet.</p>}
        </div>
      </div>

      {/* Right: edit/add form */}
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">{editing ? 'Edit Service' : 'Add Service'}</h2>
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="input"
            placeholder="Price (£)"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
          <input
            className="input"
            placeholder="Time (minutes)"
            type="number"
            value={form.time_minutes}
            onChange={(e) => setForm((f) => ({ ...f, time_minutes: Number(e.target.value) }))}
          />

          {/* Question Type Selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Question Type</label>
            <select
              className="input"
              value={form.question_type}
              onChange={(e) => setForm((f) => ({ ...f, question_type: e.target.value as any }))}
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

              <div className="space-y-2 mb-3">
                {form.dropdown_options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                    <span className="text-sm flex-1">
                      {opt.label} ({opt.value})
                    </span>
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

              <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <input
                  type="text"
                  placeholder="Label"
                  className="input text-sm"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="input text-sm"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
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

          {/* Simple nesting controls */}
          <div className="grid md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_category}
                onChange={(e) => setForm((f) => ({ ...f, is_category: e.target.checked }))}
              />
              Is category (can contain children)
            </label>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Parent service (optional)</label>
              <select
                className="input"
                value={form.parent_id || ''}
                onChange={(e) => {
                  const parentId = e.target.value || null
                  setForm((f) => ({ ...f, parent_id: parentId }))
                }}
              >
                <option value="">(No parent – top level)</option>
                {services
                  .filter((s) => s.is_category)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
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
