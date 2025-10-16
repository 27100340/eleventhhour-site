'use client'
import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Tag, Calendar, TrendingUp, Users, X } from 'lucide-react'

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

export default function DiscountCodesTab() {
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
      const res = await fetch('/api/admin/discount-codes')
      const data = await res.json()
      if (res.ok) {
        setCodes(data.codes || [])
      }
    } catch (error) {
      console.error('Error loading codes:', error)
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

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        alert(editingCode ? 'Discount code updated!' : 'Discount code created!')
        setShowModal(false)
        loadCodes()
      } else {
        alert(data.error || 'Failed to save discount code')
      }
    } catch (error) {
      console.error('Error saving code:', error)
      alert('Failed to save discount code')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this discount code?')) return

    try {
      const res = await fetch(`/api/admin/discount-codes/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Discount code deleted!')
        loadCodes()
      } else {
        alert('Failed to delete discount code')
      }
    } catch (error) {
      console.error('Error deleting code:', error)
      alert('Failed to delete discount code')
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Discount Codes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage promotional discount codes for customer bookings
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Discount Code
        </button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Codes</p>
              <p className="text-2xl font-bold text-gray-900">{codes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Codes</p>
              <p className="text-2xl font-bold text-gray-900">
                {codes.filter((c) => c.active && !isExpired(c.valid_until)).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Uses</p>
              <p className="text-2xl font-bold text-gray-900">
                {codes.reduce((sum, c) => sum + c.times_used, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {codes.filter((c) => {
                  if (!c.valid_until) return false
                  const daysUntilExpiry = Math.ceil(
                    (new Date(c.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                  return daysUntilExpiry > 0 && daysUntilExpiry <= 7
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Codes List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {codes.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No discount codes yet</h3>
            <p className="text-gray-600 mb-6">Create your first discount code to get started</p>
            <button onClick={openCreateModal} className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Discount Code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Description</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Discount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Usage</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Valid Until</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {codes.map((code) => {
                  const expired = isExpired(code.valid_until)
                  const limitReached = code.usage_limit && code.times_used >= code.usage_limit

                  return (
                    <tr key={code.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600">{code.code}</span>
                          {!code.active && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Inactive</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {code.description || <span className="text-gray-400 italic">No description</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className="font-semibold text-gray-900">{formatDiscountValue(code)}</span>
                          {code.min_order_amount > 0 && (
                            <p className="text-xs text-gray-500">Min: £{code.min_order_amount.toFixed(2)}</p>
                          )}
                          {code.max_discount_amount && code.discount_type === 'percentage' && (
                            <p className="text-xs text-gray-500">Max: £{code.max_discount_amount.toFixed(2)}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-medium">{code.times_used}</span>
                        {code.usage_limit ? ` / ${code.usage_limit}` : ' / ∞'}
                        {limitReached && (
                          <p className="text-xs text-red-600 mt-1">Limit reached</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {code.valid_until ? (
                          <div>
                            <span className={expired ? 'text-red-600' : 'text-gray-700'}>
                              {new Date(code.valid_until).toLocaleDateString('en-GB')}
                            </span>
                            {expired && <p className="text-xs text-red-600 mt-1">Expired</p>}
                          </div>
                        ) : (
                          <span className="text-gray-400">No expiry</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {code.active && !expired && !limitReached ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(code)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(code.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCode ? 'Edit Discount Code' : 'Create Discount Code'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Code *
                </label>
                <input
                  type="text"
                  required
                  className="input uppercase"
                  placeholder="e.g., SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Will be automatically converted to uppercase
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g., Summer sale - 20% off all services"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value as 'percentage' | 'fixed' })
                    }
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (£)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
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
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.discount_type === 'percentage' ? 'Percentage off' : 'Fixed amount in £'}
                  </p>
                </div>
              </div>

              {/* Min Order & Max Discount */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount (£)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave 0 for no minimum</p>
                </div>

                {formData.discount_type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Discount Amount (£)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      placeholder="Optional"
                      value={formData.max_discount_amount}
                      onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">Cap maximum discount</p>
                  </div>
                )}
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  placeholder="Unlimited"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of times code can be used (leave empty for unlimited)
                </p>
              </div>

              {/* Valid Dates */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid From *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="input"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for no expiry</p>
                </div>
              </div>

              {/* Active Status */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-6">
                  Inactive codes cannot be used by customers
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingCode ? 'Update Code' : 'Create Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
