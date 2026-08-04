'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Tag, Calendar, TrendingUp, Users, X } from 'lucide-react'
import { adminFetch } from '@/lib/admin-fetch'
import { useToast } from '@/components/ui/Toast'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

type DiscountCode = {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_discount_amount: number | null
  usage_limit: number | null
  times_used: number
  valid_from: string
  valid_until: string | null
  active: boolean
  created_at: string
}

function StatTile({ Icon, label, value }: { Icon: typeof Tag; label: string; value: number }) {
  return (
    <div className="rounded-(--radius-card) border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-(--radius-ctl) bg-accent-tint">
          <Icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm text-ink-soft">{label}</p>
          <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function DiscountCodesTab() {
  const toast = useToast()
  const [codes, setCodes] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: new Date().toISOString().slice(0, 16),
    valid_until: '',
    active: true,
  })

  useEffect(() => {
    loadCodes()
  }, [])

  async function loadCodes() {
    try {
      setLoading(true)
      const res = await adminFetch('/api/admin/discount-codes')
      const data = await res.json()
      if (res.ok) {
        setCodes(data.codes || [])
      }
    } catch {
      toast.error('Failed to load discount codes')
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingCode(null)
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '',
      max_discount_amount: '',
      usage_limit: '',
      valid_from: new Date().toISOString().slice(0, 16),
      valid_until: '',
      active: true,
    })
    setShowModal(true)
  }

  function openEditModal(code: DiscountCode) {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description || '',
      discount_type: code.discount_type,
      discount_value: code.discount_value.toString(),
      min_order_amount: code.min_order_amount.toString(),
      max_discount_amount: code.max_discount_amount?.toString() || '',
      usage_limit: code.usage_limit?.toString() || '',
      valid_from: code.valid_from.slice(0, 16),
      valid_until: code.valid_until ? code.valid_until.slice(0, 16) : '',
      active: code.active,
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      min_order_amount: Number(formData.min_order_amount) || 0,
      max_discount_amount: formData.max_discount_amount ? Number(formData.max_discount_amount) : null,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until || null,
      active: formData.active,
    }

    try {
      const url = editingCode
        ? `/api/admin/discount-codes/${editingCode.id}`
        : '/api/admin/discount-codes'
      const method = editingCode ? 'PUT' : 'POST'

      const res = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(editingCode ? 'Discount code updated' : 'Discount code created')
        setShowModal(false)
        loadCodes()
      } else {
        toast.error(data.error || 'Failed to save discount code')
      }
    } catch {
      toast.error('Failed to save discount code')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const res = await adminFetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Discount code deleted')
        loadCodes()
      } else {
        toast.error('Failed to delete discount code')
      }
    } catch {
      toast.error('Failed to delete discount code')
    }
  }

  function formatDiscountValue(code: DiscountCode) {
    if (code.discount_type === 'percentage') {
      return `${code.discount_value}%`
    }
    return `£${code.discount_value.toFixed(2)}`
  }

  function isExpired(validUntil: string | null) {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-7 w-7 text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl">Discount codes</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Create and manage promotional discount codes for customer bookings
          </p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="h-4 w-4" />
          Create discount code
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile Icon={Tag} label="Total codes" value={codes.length} />
        <StatTile
          Icon={TrendingUp}
          label="Active codes"
          value={codes.filter((c) => c.active && !isExpired(c.valid_until)).length}
        />
        <StatTile Icon={Users} label="Total uses" value={codes.reduce((sum, c) => sum + c.times_used, 0)} />
        <StatTile
          Icon={Calendar}
          label="Expiring soon"
          value={codes.filter((c) => {
            if (!c.valid_until) return false
            const daysUntilExpiry = Math.ceil(
              (new Date(c.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return daysUntilExpiry > 0 && daysUntilExpiry <= 7
          }).length}
        />
      </div>

      {/* Codes list */}
      <div className="overflow-hidden rounded-(--radius-card) border border-line bg-surface">
        {codes.length === 0 ? (
          <div className="py-12 text-center">
            <Tag className="mx-auto mb-4 h-10 w-10 text-ink-faint" />
            <h3 className="mb-1 text-base">No discount codes yet</h3>
            <p className="mb-6 text-sm text-ink-soft">Create your first discount code to get started</p>
            <button onClick={openCreateModal} className="btn-primary">
              <Plus className="h-4 w-4" />
              Create discount code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-line bg-paper">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Code</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Discount</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Usage</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Valid until</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-faint">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => {
                  const expired = isExpired(code.valid_until)
                  const limitReached = code.usage_limit && code.times_used >= code.usage_limit

                  return (
                    <tr key={code.id} className="border-b border-line transition-colors duration-150 last:border-b-0 hover:bg-paper">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-accent-dark">{code.code}</span>
                          {!code.active && <Badge tone="neutral">Inactive</Badge>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-soft">
                        {code.description || <span className="italic text-ink-faint">No description</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm">
                          <span className="font-semibold text-ink">{formatDiscountValue(code)}</span>
                          {code.min_order_amount > 0 && (
                            <p className="text-xs text-ink-faint">Min: £{code.min_order_amount.toFixed(2)}</p>
                          )}
                          {code.max_discount_amount && code.discount_type === 'percentage' && (
                            <p className="text-xs text-ink-faint">Max: £{code.max_discount_amount.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span className="font-medium text-ink">{code.times_used}</span>
                        <span className="text-ink-soft">{code.usage_limit ? ` / ${code.usage_limit}` : ' / ∞'}</span>
                        {limitReached && <p className="mt-1 text-xs font-medium text-red-700">Limit reached</p>}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {code.valid_until ? (
                          <div>
                            <span className={expired ? 'font-medium text-red-700' : 'text-ink-soft'}>
                              {new Date(code.valid_until).toLocaleDateString('en-GB')}
                            </span>
                            {expired && <p className="mt-1 text-xs font-medium text-red-700">Expired</p>}
                          </div>
                        ) : (
                          <span className="text-ink-faint">No expiry</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {code.active && !expired && !limitReached ? (
                          <Badge tone="accent">Active</Badge>
                        ) : (
                          <Badge tone="neutral">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(code)}
                            className="rounded-(--radius-ctl) p-2 text-ink-soft transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
                            aria-label={`Edit ${code.code}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            className="rounded-(--radius-ctl) p-2 text-red-700 transition-colors duration-150 hover:bg-red-50"
                            aria-label={`Delete ${code.code}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-(--radius-card) bg-surface shadow-soft">
            <div className="sticky top-0 flex items-center justify-between border-b border-line bg-surface px-6 py-4">
              <h3 className="text-lg">
                {editingCode ? 'Edit discount code' : 'Create discount code'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-(--radius-ctl) p-2 text-ink-faint transition-colors duration-150 hover:bg-ink/5 hover:text-ink"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              {/* Code */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Discount code *</label>
                <input
                  type="text"
                  required
                  className="input uppercase"
                  placeholder="e.g., SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-faint">Will be automatically converted to uppercase</p>
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Description</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g., Summer sale - 20% off all services"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Discount type *</label>
                  <select
                    required
                    className="input"
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed amount (£)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Discount value *</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    className="input"
                    placeholder={formData.discount_type === 'percentage' ? '10' : '20.00'}
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-ink-faint">
                    {formData.discount_type === 'percentage' ? 'Percentage off' : 'Fixed amount in £'}
                  </p>
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Minimum order amount (£)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-ink-faint">Leave 0 for no minimum</p>
                </div>

                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-ink">Max discount amount (£)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="Optional"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-ink-faint">Cap maximum discount</p>
                  </div>
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink">Usage limit</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  Maximum number of times code can be used (leave empty for unlimited)
                </p>
              </div>

              {/* Valid Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Valid from *</label>
                  <input
                    type="datetime-local"
                    required
                    className="input"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink">Valid until</label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-ink-faint">Leave empty for no expiry</p>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-(--color-accent)"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-ink">Active</span>
                </label>
                <p className="ml-6 mt-1 text-xs text-ink-faint">Inactive codes cannot be used by customers</p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 border-t border-line pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 py-3">
                  {editingCode ? 'Update code' : 'Create code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
