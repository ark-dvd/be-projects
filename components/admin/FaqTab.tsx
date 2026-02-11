'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Loader2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import { adminFetch, adminPost, adminPut, adminDelete } from '@/lib/admin-api'

// Types
interface FaqItem {
  _id: string
  _createdAt: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

interface FormData {
  _id?: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

const initialFormData: FormData = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  isActive: true,
}

type StatusFilter = 'all' | 'active' | 'hidden'

// Toggle switch component
function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div className={`w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-gray-300'
        }`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </label>
  )
}

// Delete confirmation dialog
function DeleteDialog({
  question,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  question: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete FAQ?</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete{' '}
          <span className="font-medium">&ldquo;{question}&rdquo;</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast notification
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-20 lg:bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Loading skeleton
function FaqSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-16" />
            <div className="h-6 bg-gray-200 rounded-full w-12" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Active badge component
function ActiveBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${
      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {isActive ? 'Active' : 'Hidden'}
    </span>
  )
}

export default function FaqTab() {
  // State
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [view, setView] = useState<'list' | 'form'>('list')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Fetch data
  const fetchFaqs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminFetch<FaqItem[]>('faq')
      setFaqs(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load FAQ items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  // Filter FAQs
  const filteredFaqs = faqs
    .filter(f => {
      if (filter === 'active') return f.isActive
      if (filter === 'hidden') return !f.isActive
      return true
    })
    .sort((a, b) => a.order - b.order)

  // Form handlers
  const openAddForm = () => {
    setFormData(initialFormData)
    setFormErrors({})
    setView('form')
  }

  const openEditForm = (faq: FaqItem) => {
    setFormData({
      _id: faq._id,
      question: faq.question || '',
      answer: faq.answer || '',
      category: faq.category || '',
      order: faq.order ?? 0,
      isActive: faq.isActive ?? true,
    })
    setFormErrors({})
    setView('form')
  }

  const closeForm = () => {
    setView('list')
  }

  const updateFormField = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!(formData.question || '').trim()) errors.question = 'Question is required'
    if (!(formData.answer || '').trim()) errors.answer = 'Answer is required'

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Save FAQ
  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const payload: Record<string, unknown> = {
        _id: formData._id,
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        order: formData.order,
        isActive: formData.isActive,
      }

      if (formData._id) {
        await adminPut('faq', payload)
        setToast({ message: 'FAQ updated successfully', type: 'success' })
      } else {
        await adminPost('faq', payload)
        setToast({ message: 'FAQ created successfully', type: 'success' })
      }

      await fetchFaqs()
      closeForm()
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Failed to save FAQ', type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  // Delete FAQ
  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      await adminDelete('faq', deleteTarget._id)
      setToast({ message: 'FAQ deleted', type: 'success' })
      setFaqs(prev => prev.filter(f => f._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : 'Failed to delete FAQ', type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Truncate text
  const truncateText = (text: string, maxLength: number) => {
    const safeText = text || ''
    if (safeText.length <= maxLength) return safeText
    return safeText.slice(0, maxLength).trim() + '...'
  }

  // Render list view
  if (view === 'list') {
    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Add New FAQ
            </button>
            <span className="text-sm text-gray-500">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            {(['all', 'active', 'hidden'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <FaqSkeleton key={i} />)}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-900 font-medium mb-2">Failed to load FAQ items</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchFaqs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredFaqs.length === 0 && (
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No FAQ items yet' : `No ${filter} FAQ items`}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' ? 'Help visitors find answers to common questions.' : 'Try a different filter.'}
            </p>
            {filter === 'all' && (
              <button
                onClick={openAddForm}
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Plus className="h-5 w-5" />
                Add Your First FAQ
              </button>
            )}
          </div>
        )}

        {/* FAQ List */}
        {!loading && !error && filteredFaqs.length > 0 && (
          <div className="space-y-4">
            {filteredFaqs.map(faq => (
              <div key={faq._id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Question */}
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {truncateText(faq.question, 120)}
                    </h3>
                    {/* Answer preview */}
                    <p className="text-sm text-gray-500 mb-3">
                      {truncateText(faq.answer, 150)}
                    </p>
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <ActiveBadge isActive={faq.isActive} />
                      {faq.category && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {faq.category}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                        Order: {faq.order}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEditForm(faq)}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      aria-label="Edit FAQ"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(faq)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete FAQ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete dialog */}
        {deleteTarget && (
          <DeleteDialog
            question={truncateText(deleteTarget.question, 80)}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}

        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    )
  }

  // Render form view
  return (
    <div className="fixed inset-0 z-30 lg:relative lg:inset-auto">
      <div className="h-full bg-white lg:bg-transparent overflow-y-auto">
        {/* Form header */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-4">
          <button
            onClick={closeForm}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {formData._id ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
        </div>

        {/* Form content */}
        <div className="p-4 lg:p-0 lg:py-4 pb-32 lg:pb-4 max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">FAQ Details</h3>

            <div className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => updateFormField('question', e.target.value)}
                  placeholder="e.g., What is your typical project timeline?"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    formErrors.question ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.question && <p className="text-red-500 text-sm mt-1">{formErrors.question}</p>}
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => updateFormField('answer', e.target.value)}
                  rows={5}
                  placeholder="Provide a clear, helpful answer..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none ${
                    formErrors.answer ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.answer && <p className="text-red-500 text-sm mt-1">{formErrors.answer}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => updateFormField('category', e.target.value)}
                  placeholder='e.g., "General", "Pricing", "Process"'
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-sm text-gray-500 mt-1">Optional grouping for the public FAQ page</p>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>

            <div className="space-y-4">
              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => updateFormField('order', parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
                <p className="text-sm text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Show on Website */}
              <div>
                <ToggleSwitch
                  checked={formData.isActive}
                  onChange={(checked) => updateFormField('isActive', checked)}
                  label="Show on Website"
                />
                <p className="text-sm text-gray-500 mt-1 ml-14">
                  {formData.isActive ? 'This FAQ is visible to visitors' : 'This FAQ is hidden from visitors'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-0 right-0 lg:relative bg-white border-t p-4 flex items-center justify-end gap-3">
          <button
            onClick={closeForm}
            disabled={isSaving}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium flex items-center gap-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSaving ? 'Saving...' : 'Save FAQ'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
