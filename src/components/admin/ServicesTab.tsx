'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { GripVertical } from 'lucide-react'
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
  description: string | null
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
  description: null,
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
      description: s.description || null,
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
      description: form.description,
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

  const smallBtn =
    'rounded-(--radius-ctl) border border-line px-3 py-1 text-sm font-medium text-ink transition-colors duration-150 hover:bg-ink/5'
  const smallDangerBtn =
    'rounded-(--radius-ctl) border border-line px-3 py-1 text-sm font-medium text-red-700 transition-colors duration-150 hover:bg-red-50'

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      {/* Left: hierarchical list of services */}
      <div className="rounded-(--radius-card) border border-line bg-surface p-5">
        <h2 className="text-base">All services</h2>
        <p className="mt-1 mb-4 text-sm text-ink-soft">
          Drag parents to reorder main categories. Drag children to reorder within their parent.
        </p>
        <div className="space-y-2">
          {hierarchy.map(({ service: parent, children }) => (
            <div key={parent.id} className="overflow-hidden rounded-(--radius-ctl) border border-line">
              {/* Parent Service */}
              <div
                draggable
                onDragStart={() => handleDragStart(parent)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropParent(e, parent)}
                className={`flex cursor-move items-center justify-between bg-accent-tint/50 p-3 transition-colors duration-150 hover:bg-accent-tint ${
                  draggedService?.id === parent.id ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-ink-faint" />
                  <div>
                    <p className="font-semibold text-ink">{parent.name}</p>
                    <p className="text-sm text-ink-soft">
                      £{Number(parent.price).toFixed(2)} · {parent.time_minutes} min · {parent.question_type} ·{' '}
                      {parent.active ? 'Active' : 'Hidden'}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {parent.is_category ? 'Category' : 'Service'}
                      {parent.category_type && ` · ${String(parent.category_type).replace('_', ' ')}`}
                      {parent.per_unit_type && parent.per_unit_type !== 'item' && ` · per ${parent.per_unit_type}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => startEdit(parent)} className={smallBtn}>
                    Edit
                  </button>
                  <button onClick={() => remove(parent.id)} className={smallDangerBtn}>
                    Delete
                  </button>
                </div>
              </div>

              {/* Children Services */}
              {children.length > 0 && (
                <div className="border-t border-line bg-paper">
                  {children.map((child) => (
                    <div
                      key={child.id}
                      draggable
                      onDragStart={() => handleDragStart(child)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropChild(e, child, parent.id)}
                      className={`ml-8 flex cursor-move items-center justify-between border-b border-line px-3 py-3 transition-colors duration-150 last:border-b-0 hover:bg-ink/5 ${
                        draggedService?.id === child.id ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                        <div>
                          <p className="text-sm font-medium text-ink">{child.name}</p>
                          <p className="text-xs text-ink-soft">
                            £{Number(child.price).toFixed(2)} · {child.time_minutes} min · {child.question_type} ·{' '}
                            {child.active ? 'Active' : 'Hidden'}
                          </p>
                          {child.per_unit_type && child.per_unit_type !== 'item' && (
                            <p className="text-xs text-ink-faint">per {child.per_unit_type}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button onClick={() => startEdit(child)} className={smallBtn}>
                          Edit
                        </button>
                        <button onClick={() => remove(child.id)} className={smallDangerBtn}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {services.length === 0 && <p className="text-sm text-ink-soft">No services yet.</p>}
        </div>
      </div>

      {/* Right: edit/add form */}
      <div className="h-max rounded-(--radius-card) border border-line bg-surface p-5">
        <h2 className="mb-4 text-base">{editing ? 'Edit service' : 'Add service'}</h2>
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
          <textarea
            className="input"
            placeholder="Description (shown to customers in booking form)"
            rows={2}
            value={form.description || ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
          />

          {/* Question Type Selector */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink">Question type</label>
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
            <div className="rounded-(--radius-ctl) border border-line bg-paper p-3">
              <label className="mb-2 block text-sm font-medium text-ink">Dropdown options</label>

              <div className="mb-3 space-y-2">
                {form.dropdown_options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-(--radius-ctl) border border-line bg-surface p-2">
                    <span className="flex-1 text-sm text-ink">
                      {opt.label} ({opt.value})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDropdownOption(idx)}
                      className="text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {form.dropdown_options.length === 0 && (
                  <p className="text-xs text-ink-faint">No options added yet</p>
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
                <button type="button" onClick={addDropdownOption} className="btn-primary px-3 py-1 text-sm">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Simple nesting controls */}
          <div className="grid gap-3">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                className="h-4 w-4 accent-(--color-accent)"
                checked={form.is_category}
                onChange={(e) => setForm((f) => ({ ...f, is_category: e.target.checked }))}
              />
              Is category (can contain children)
            </label>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Parent service (optional)</label>
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

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 accent-(--color-accent)"
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
              <button onClick={reset} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
