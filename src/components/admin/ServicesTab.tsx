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
  const [draggedService, setDraggedService] = useState<Service | null>(null)
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

  // Build hierarchical structure for display
  function buildHierarchy(): Array<{ service: Service; children: Service[] }> {
    const parents = services.filter((s) => !s.parent_id)
    return parents.map((parent) => ({
      service: parent,
      children: services.filter((s) => s.parent_id === parent.id).sort((a, b) => a.order_index - b.order_index),
    }))
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

  // Drag and drop handlers for hierarchical services
  function handleDragStart(service: Service) {
    setDraggedService(service)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
  }

  async function handleDropParent(e: React.DragEvent<HTMLDivElement>, targetService: Service) {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedService || draggedService.id === targetService.id) return

    // Only allow reordering parents with parents
    if (draggedService.parent_id || targetService.parent_id) return

    const parents = services.filter((s) => !s.parent_id)
    const draggedIdx = parents.findIndex((s) => s.id === draggedService.id)
    const targetIdx = parents.findIndex((s) => s.id === targetService.id)

    if (draggedIdx === -1 || targetIdx === -1) return

    const reordered = [...parents]
    const [draggedItem] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, draggedItem)

    // Update order_index for all parents
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('services').update({ order_index: i }).eq('id', reordered[i].id)
    }

    setDraggedService(null)
    await load()
  }

  async function handleDropChild(e: React.DragEvent<HTMLDivElement>, targetService: Service, parentId: string) {
    e.preventDefault()
    e.stopPropagation()

    if (!draggedService || draggedService.id === targetService.id) return

    // Only allow reordering children within the same parent
    if (draggedService.parent_id !== parentId || targetService.parent_id !== parentId) return

    const children = services.filter((s) => s.parent_id === parentId)
    const draggedIdx = children.findIndex((s) => s.id === draggedService.id)
    const targetIdx = children.findIndex((s) => s.id === targetService.id)

    if (draggedIdx === -1 || targetIdx === -1) return

    const reordered = [...children]
    const [draggedItem] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, draggedItem)

    // Update order_index for all children of this parent
    for (let i = 0; i < reordered.length; i++) {
      await supabase.from('services').update({ order_index: i }).eq('id', reordered[i].id)
    }

    setDraggedService(null)
    await load()
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

  const hierarchy = buildHierarchy()

  return (
    <div className="grid md:grid-cols-[2fr_1fr] gap-6">
      {/* Left: hierarchical list of services */}
      <div className="rounded-2xl border bg-white p-4">
        <h2 className="font-semibold mb-3">All Services (Drag to Reorder)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Drag parents to reorder main categories. Drag children to reorder within their parent.
        </p>
        <div className="space-y-2">
          {hierarchy.map(({ service: parent, children }) => (
            <div key={parent.id} className="border rounded-lg">
              {/* Parent Service */}
              <div
                draggable
                onDragStart={() => handleDragStart(parent)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropParent(e, parent)}
                className={`p-3 flex items-center justify-between cursor-move hover:bg-gray-50 transition-colors bg-blue-50 ${
                  draggedService?.id === parent.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                  <div>
                    <p className="font-bold">{parent.name}</p>
                    <p className="text-sm text-slate-600">
                      £{Number(parent.price).toFixed(2)} • {parent.time_minutes} min • {parent.question_type} •{' '}
                      {parent.active ? 'Active' : 'Hidden'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {parent.is_category ? 'Category' : 'Service'}
                      {parent.category_type && ` • ${String(parent.category_type).replace('_', ' ')}`}
                      {parent.per_unit_type && parent.per_unit_type !== 'item' && ` • per ${parent.per_unit_type}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(parent)}
                    className="rounded-full border px-3 py-1 text-sm hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => remove(parent.id)}
                    className="rounded-full border px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Children Services */}
              {children.length > 0 && (
                <div className="bg-gray-50 border-t">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      draggable
                      onDragStart={() => handleDragStart(child)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropChild(e, child, parent.id)}
                      className={`py-3 px-3 ml-8 flex items-center justify-between cursor-move hover:bg-gray-100 transition-colors border-b last:border-b-0 ${
                        draggedService?.id === child.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                        <div>
                          <p className="font-medium text-sm">{child.name}</p>
                          <p className="text-xs text-slate-600">
                            £{Number(child.price).toFixed(2)} • {child.time_minutes} min • {child.question_type} •{' '}
                            {child.active ? 'Active' : 'Hidden'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {child.per_unit_type && child.per_unit_type !== 'item' && `per ${child.per_unit_type}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(child)}
                          className="rounded-full border px-2 py-1 text-xs hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(child.id)}
                          className="rounded-full border px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
